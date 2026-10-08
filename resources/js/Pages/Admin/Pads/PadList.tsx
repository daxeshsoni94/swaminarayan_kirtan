import React, { useEffect, useMemo, useState, useCallback } from "react";

import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";

import TableContainer from "../../../Components/Common/TableContainer";

import { Head, router, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import DeleteModal from "../../../Components/Common/DeleteModal";

import Layout from "../../../Layouts";

import { gujaratiNumber } from "../../../utils/number";

import { useAlphabetFilter } from "../../../hooks/useAlphabetFilter";

import AlphabetFilter from "../../../Components/Common/AlphabetFilter";

import { usePermission } from "../../../hooks/usePermission";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Pad {
    id: number;
    kirtan_id: number;
    title: string;
    value: string;
    status: string;
    created_at: string;
    establish_date?: string | null;
    kirtan?: {
        id: number;
        title: string;
    };
}

interface PaginatedPads {
    data: Pad[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    pads: PaginatedPads;
    filters: {
        search?: string;
        status?: string;
        letter?: string;
    };
}

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

// ─────────────────────────────────────────────────────────────────────────────
// Centralized Translator
// ─────────────────────────────────────────────────────────────────────────────

const createTranslator = (
    translations: Record<string, any>,
): TranslationFunction => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ): string => {
        let text = translations[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });

        return text;
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Date Formatter
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (value: any, locale: string): string => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const parts = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).formatToParts(date);

    const day = parts.find((part) => part.type === "day")?.value ?? "";

    const month = parts.find((part) => part.type === "month")?.value ?? "";

    const year = parts.find((part) => part.type === "year")?.value ?? "";

    const formatted = `${day}-${month}-${year}`;

    return gujaratiNumber(formatted, locale);
};
// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({
    status,
    tr,
}: {
    status: string;
    tr: TranslationFunction;
}) => {
    const key = (status || "").toLowerCase();

    const classMap: Record<string, string> = {
        published: "badge bg-success-subtle text-success text-uppercase",

        save: "badge bg-success-subtle text-success text-uppercase",

        draft: "badge bg-warning-subtle text-warning text-uppercase",
    };

    let label = status || "—";

    if (key === "save" || key === "published") {
        label = tr("published");
    } else if (key === "draft") {
        label = tr("draft");
    }

    return (
        <span
            className={
                classMap[key] ??
                "badge bg-secondary-subtle text-secondary text-uppercase"
            }
        >
            {label}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Truncate Lyrics
// ─────────────────────────────────────────────────────────────────────────────

const truncate = (text: string, len = 60) => {
    if (!text) {
        return "";
    }

    return text.length > len ? `${text.slice(0, len)}…` : text;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const PadList: React.FC<Props> = ({ pads, filters }) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale } = page;

    // ─────────────────────────────────────────────────────────────────────────
    // Locale
    // ─────────────────────────────────────────────────────────────────────────

    const currentLocale = locale || "gu";

    // ─────────────────────────────────────────────────────────────────────────
    // Central Translator
    // ─────────────────────────────────────────────────────────────────────────

    const tr = useMemo(() => createTranslator(translations), [translations]);

    // ─────────────────────────────────────────────────────────────────────────
    // Dynamic Role Prefix
    // ─────────────────────────────────────────────────────────────────────────

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    // ─────────────────────────────────────────────────────────────────────────
    // Permissions
    // ─────────────────────────────────────────────────────────────────────────

    const { can } = usePermission();

    const canCreate = can("pads", "create");
    const canEdit = can("pads", "edit");
    const canDelete = can("pads", "delete");

    // ─────────────────────────────────────────────────────────────────────────
    // Pad Data
    // ─────────────────────────────────────────────────────────────────────────

    const [padData, setPadData] = useState<Pad[]>(pads?.data ?? []);

    // ─────────────────────────────────────────────────────────────────────────
    // Filters
    // ─────────────────────────────────────────────────────────────────────────

    const [search, setSearch] = useState(filters?.search ?? "");

    const [statusFilter, setStatusFilter] = useState(filters?.status ?? "");

    // ─────────────────────────────────────────────────────────────────────────
    // Delete State
    // ─────────────────────────────────────────────────────────────────────────

    const [pad, setPad] = useState<Pad | null>(null);

    const [deleteModal, setDeleteModal] = useState<boolean>(false);

    const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);

    const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<
        number[]
    >([]);

    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // Alphabet Filter
    // ─────────────────────────────────────────────────────────────────────────

    const { selectedLetter, handleLetterFilter } = useAlphabetFilter(
        "role.pads.list",
        {
            rolePrefix,
            search: search || undefined,
            status: statusFilter || undefined,
            per_page: 10,
        },
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Sync Filters
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        setSearch(filters?.search ?? "");
        setStatusFilter(filters?.status ?? "");
    }, [filters]);

    // ─────────────────────────────────────────────────────────────────────────
    // Sync Pad Data
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (pads?.data) {
            setPadData(pads.data);
        }
    }, [pads]);

    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────

    const handleSearch = (value: string) => {
        setSearch(value);

        router.get(
            route("role.pads.list", {
                rolePrefix,
            }),
            {
                search: value || undefined,
                status: statusFilter || undefined,
                letter: selectedLetter || undefined,
                per_page: 10,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Edit
    // ─────────────────────────────────────────────────────────────────────────

    const handleEdit = (row: Pad) => {
        router.visit(
            route("role.pads.edit", {
                rolePrefix,
                pad: row.id,
            }),
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Row Click
    // ─────────────────────────────────────────────────────────────────────────

    const handleRowClick = (row: Pad) => {
        router.visit(
            route("role.pads.show", {
                rolePrefix,
                pad: row.id,
            }),
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Delete Single
    // ─────────────────────────────────────────────────────────────────────────

    const onClickDelete = (item: Pad) => {
        setPad(item);
        setDeleteModal(true);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Select All
    // ─────────────────────────────────────────────────────────────────────────

    const checkedAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                const allIds = padData.map((p) => Number(p.id));

                setSelectedCheckBoxDelete(allIds);
                setIsMultiDeleteButton(allIds.length > 0);
            } else {
                setSelectedCheckBoxDelete([]);
                setIsMultiDeleteButton(false);
            }
        },
        [padData],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Delete Single Pad
    // ─────────────────────────────────────────────────────────────────────────

    const handleDeletePad = () => {
        if (!pad) {
            return;
        }

        router.delete(
            route("role.pads.destroy", {
                rolePrefix,
                pad: pad.id,
            }),
            {
                onSuccess: () => {
                    setDeleteModal(false);
                    setPad(null);
                },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Delete Multiple Pads
    // ─────────────────────────────────────────────────────────────────────────

    const deleteMultiple = () => {
        const ids = selectedCheckBoxDelete;

        if (!ids.length) {
            return;
        }

        router.post(
            route("role.pads.bulk-destroy", {
                rolePrefix,
            }),
            {
                ids,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedCheckBoxDelete([]);
                    setIsMultiDeleteButton(false);
                },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Table Columns
    // ─────────────────────────────────────────────────────────────────────────

    const columns = useMemo(
        () => [
            // ────────────────────────────────────────────────────────────────
            // Checkbox
            // ────────────────────────────────────────────────────────────────
            ...(canDelete
                ? [
                      {
                          id: "select",

                          header: (
                              <input
                                  type="checkbox"
                                  id="checkBoxAll"
                                  className="form-check-input"
                                  checked={
                                      padData.length > 0 &&
                                      selectedCheckBoxDelete.length ===
                                          padData.length
                                  }
                                  onChange={(e) => checkedAll(e.target.checked)}
                              />
                          ),

                          cell: (cellProps: any) => (
                              <input
                                  type="checkbox"
                                  className="padCheckBox form-check-input"
                                  value={cellProps.row.original.id}
                                  checked={selectedCheckBoxDelete.includes(
                                      Number(cellProps.row.original.id),
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                      const id = Number(
                                          cellProps.row.original.id,
                                      );

                                      setSelectedCheckBoxDelete((prev) => {
                                          const updated = e.target.checked
                                              ? [...prev, id]
                                              : prev.filter(
                                                    (selectedId) =>
                                                        selectedId !== id,
                                                );

                                          setIsMultiDeleteButton(
                                              updated.length > 0,
                                          );

                                          return updated;
                                      });
                                  }}
                              />
                          ),
                      },
                  ]
                : []),

            // ────────────────────────────────────────────────────────────────
            // ID
            // ────────────────────────────────────────────────────────────────
            {
                id: "id",
                header: tr("id"),
                accessorKey: "id",
                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const rowIndex =
                        (pads.current_page - 1) * pads.per_page +
                        cellProps.row.index +
                        1;
                    return (
                        <span className="fw-medium text-primary">
                            {gujaratiNumber(rowIndex, currentLocale)}
                        </span>
                    );
                },
            },

            // ────────────────────────────────────────────────────────────────
            // Title
            // ────────────────────────────────────────────────────────────────
            {
                id: "title",
                header: tr("pad_title"),
                accessorKey: "title",
                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span className="text-body fw-semibold">
                        {truncate(cellProps.getValue())}
                    </span>
                ),
            },

            // ────────────────────────────────────────────────────────────────
            // Lyrics
            // ────────────────────────────────────────────────────────────────
            {
                id: "value",
                header: tr("lyrics"),
                accessorKey: "value",
                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span className="text-muted" style={{ fontSize: "13px" }}>
                        {truncate(cellProps.getValue())}
                    </span>
                ),
            },

            // ────────────────────────────────────────────────────────────────
            // Status
            // ────────────────────────────────────────────────────────────────
            ...(canEdit
                ? [
                      {
                          id: "status",
                          header: tr("status"),
                          accessorKey: "status",
                          enableColumnFilter: false,

                          cell: (cellProps: any) => (
                              <StatusBadge
                                  status={cellProps.getValue()}
                                  tr={tr}
                              />
                          ),
                      },
                  ]
                : []),

            // ────────────────────────────────────────────────────────────────
            // Created At
            // ────────────────────────────────────────────────────────────────
            {
                id: "created_at",
                header: tr("created_at"),
                accessorKey: "created_at",
                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const formattedDate = formatDate(
                        cellProps.getValue(),
                        currentLocale,
                    );

                    return <span className="text-muted">{formattedDate}</span>;
                },
            },

            // ────────────────────────────────────────────────────────────────
            // Actions
            // ────────────────────────────────────────────────────────────────
            {
                id: "actions",
                header: tr("actions"),

                cell: (cellProps: any) => (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Dropdown drop="down">
                            <Dropdown.Toggle
                                as="a"
                                className="btn btn-soft-secondary btn-sm arrow-none"
                            >
                                <i className="ri-more-fill align-middle"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="dropdown-menu-end">
                                {/* View */}
                                <li>
                                    <Dropdown.Item
                                        onClick={() =>
                                            router.visit(
                                                route("role.pads.show", {
                                                    rolePrefix,
                                                    pad: cellProps.row.original
                                                        .id,
                                                }),
                                            )
                                        }
                                    >
                                        <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                                        {tr("view")}
                                    </Dropdown.Item>
                                </li>

                                {/* Edit */}
                                {canEdit && (
                                    <li>
                                        <Dropdown.Item
                                            onClick={() =>
                                                handleEdit(
                                                    cellProps.row.original,
                                                )
                                            }
                                        >
                                            <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                            {tr("edit")}
                                        </Dropdown.Item>
                                    </li>
                                )}

                                {/* Delete */}
                                {canDelete && (
                                    <li>
                                        <Dropdown.Item
                                            className="remove-item-btn"
                                            data-bs-toggle="modal"
                                            href="#deleteOrder"
                                            onClick={() => {
                                                const padRow =
                                                    cellProps.row.original;

                                                onClickDelete(padRow);
                                            }}
                                        >
                                            <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                            {tr("delete")}
                                        </Dropdown.Item>
                                    </li>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ],
        [
            tr,
            currentLocale,
            checkedAll,
            selectedCheckBoxDelete,
            padData,
            canDelete,
            canEdit,
            rolePrefix,
        ],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <React.Fragment>
            <Head title={tr("pads_list")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={tr("pads_list")}
                        pageTitle={tr("pads")}
                    />

                    {/* Single Delete Modal */}
                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDeletePad}
                        onCloseClick={() => setDeleteModal(false)}
                    />

                    {/* Multiple Delete Modal */}
                    <DeleteModal
                        show={deleteModalMulti}
                        onDeleteClick={() => {
                            deleteMultiple();
                            setDeleteModalMulti(false);
                        }}
                        onCloseClick={() => setDeleteModalMulti(false)}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                {/* ───────────────────────────────────────── */}
                                {/* Header */}
                                {/* ───────────────────────────────────────── */}

                                <Card.Header className="border-0">
                                    <div className="d-flex align-items-center">
                                        <h5 className="card-title mb-0 flex-grow-1">
                                            {tr("pads")}
                                        </h5>

                                        <div className="flex-shrink-0">
                                            <div className="d-flex flex-wrap gap-2">
                                                {/* Create */}
                                                {canCreate && (
                                                    <button
                                                        className="btn btn-danger add-btn"
                                                        onClick={() =>
                                                            router.visit(
                                                                route(
                                                                    "role.pads.create",
                                                                    {
                                                                        rolePrefix,
                                                                    },
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <i className="ri-add-line align-bottom"></i>{" "}
                                                        {tr("create_pad")}
                                                    </button>
                                                )}

                                                {/* Multiple Delete */}
                                                {canDelete &&
                                                    isMultiDeleteButton && (
                                                        <button
                                                            className="btn btn-soft-danger"
                                                            onClick={() =>
                                                                setDeleteModalMulti(
                                                                    true,
                                                                )
                                                            }
                                                        >
                                                            <i className="ri-delete-bin-2-line"></i>
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </Card.Header>

                                {/* ───────────────────────────────────────── */}
                                {/* Body */}
                                {/* ───────────────────────────────────────── */}

                                <Card.Body className="pt-0">
                                    {/* Search */}
                                    <div className="d-flex justify-content-end mb-3">
                                        <input
                                            type="search"
                                            className="form-control"
                                            style={{
                                                maxWidth: 330,
                                            }}
                                            placeholder={tr(
                                                "search_placeholder_padlist",
                                            )}
                                            value={search}
                                            onChange={(e) =>
                                                handleSearch(e.target.value)
                                            }
                                        />
                                    </div>

                                    {/* Alphabet Filter */}
                                    <AlphabetFilter
                                        selectedLetter={selectedLetter}
                                        onSelect={handleLetterFilter}
                                    />

                                    {/* Table */}
                                    <div>
                                        {padData && padData.length > 0 ? (
                                            <>
                                                <TableContainer
                                                    columns={columns}
                                                    data={padData || []}
                                                    isGlobalFilter={false}
                                                    customPageSize={10}
                                                    divClass="table-responsive table-card mb-3"
                                                    tableClass="align-middle table-nowrap mb-0"
                                                    theadClass=""
                                                    thClass=""
                                                    onRowClick={handleRowClick}
                                                />

                                                {/* Pagination */}
                                                {pads.last_page > 1 && (
                                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-2">
                                                        <small className="text-muted">
                                                            {tr("showing")}{" "}
                                                            {gujaratiNumber(
                                                                padData.length,
                                                                currentLocale,
                                                            )}{" "}
                                                            {tr("of")}{" "}
                                                            {gujaratiNumber(
                                                                pads.total,
                                                                currentLocale,
                                                            )}{" "}
                                                            {tr("results")}
                                                        </small>

                                                        <ul className="pagination pagination-sm mb-0">
                                                            {pads.links.map(
                                                                (link, idx) => (
                                                                    <li
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className={`page-item ${
                                                                            link.active
                                                                                ? "active"
                                                                                : ""
                                                                        } ${
                                                                            !link.url
                                                                                ? "disabled"
                                                                                : ""
                                                                        }`}
                                                                    >
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() =>
                                                                                link.url &&
                                                                                router.visit(
                                                                                    link.url,
                                                                                    {
                                                                                        preserveState: true,
                                                                                    },
                                                                                )
                                                                            }
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: link.label,
                                                                            }}
                                                                        />
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-5">
                                                <div className="text-muted">
                                                    {tr("no_pads_found")}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* <ToastContainer
                                        closeButton={false}
                                        limit={1}
                                    /> */}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

PadList.layout = (page: any) => <Layout>{page}</Layout>;

export default PadList;
