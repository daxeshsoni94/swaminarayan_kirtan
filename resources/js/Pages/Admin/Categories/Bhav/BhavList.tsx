import React, { useEffect, useMemo, useState, useCallback } from "react";

import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";

import TableContainer from "../../../../Components/Common/TableContainer";

import { Head, router, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import DeleteModal from "../../../../Components/Common/DeleteModal";

import Layout from "../../../../Layouts";

import { gujaratiNumber } from "../../../../utils/number";

import { useAlphabetFilter } from "../../../../hooks/useAlphabetFilter";

import AlphabetFilter from "../../../../Components/Common/AlphabetFilter";

import { usePermission } from "../../../../hooks/usePermission";

// ─────────────────────────────────────────────────────────────────────────────
// Resolve multilingual value dynamically
//
// Example:
// { en: "Diwali", gu: "દિવાળી" }
//
// If locale = "gu" → દિવાળી
// If locale = "en" → Diwali
//
// No language code is hardcoded here.
// ─────────────────────────────────────────────────────────────────────────────

const tValue = (value: any, locale: string): string => {
    if (value == null) return "";

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        return value[locale] ?? Object.values(value)[0] ?? "";
    }

    return String(value);
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BhavItem {
    id: number;
    type?: string | Record<string, string>;
    value: string | Record<string, string>;
    pads_count?: number;
    created_by?: number;
    created_at: string;
    updated_at?: string;
}

interface PaginatedBhavs {
    data: BhavItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const BhavList = ({
    bhavs,
    filters,
}: {
    bhavs: PaginatedBhavs;
    filters?: {
        search?: string;
    };
}) => {
    const page = usePage().props as any;

    const { auth, translations: pageTranslations, locale: pageLocale } = page;

    // Laravel already provides the current locale.
    const locale = pageLocale;

    // Centralized Laravel translations
    const translations = pageTranslations || {};

    // Languages from database
    const languages = page.languages || [];

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const { can } = usePermission();

    const canCreate = can("categories", "create");
    const canEdit = can("categories", "edit");
    const canDelete = can("categories", "delete");

    const [data, setData] = useState<BhavItem[]>(bhavs?.data ?? []);

    // ─────────────────────────────────────────────────────────────────────────
    // Delete state
    // ─────────────────────────────────────────────────────────────────────────

    const [item, setItem] = useState<BhavItem | null>(null);

    const [deleteModal, setDeleteModal] = useState(false);

    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────

    const [search, setSearch] = useState(filters?.search ?? "");

    const { selectedLetter, handleLetterFilter } = useAlphabetFilter(
        "role.category.bhavlist",
        {
            rolePrefix,
            search: search || undefined,
            per_page: 10,
        },
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Selected IDs
    // ─────────────────────────────────────────────────────────────────────────

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // Update local data when Inertia receives new props
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (bhavs?.data) {
            setData(bhavs.data);
        }
    }, [bhavs]);

    // ─────────────────────────────────────────────────────────────────────────
    // Column labels
    // ─────────────────────────────────────────────────────────────────────────

    const labels = useMemo(
        () => ({
            id: translations.id ?? "ID",
            value: translations.value ?? translations.bhav ?? "",
            padsCount: translations.padsCount ?? translations.total_pads ?? "",
            createdAt: translations.createdAt ?? translations.created_at ?? "",
            actions: translations.actions ?? "",
        }),
        [translations],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Edit
    // ─────────────────────────────────────────────────────────────────────────

    const handleEdit = (row: BhavItem) => {
        router.visit(
            route("role.category.bhavedit", {
                rolePrefix,
                bhav: row.id,
            }),
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // View pads
    // ─────────────────────────────────────────────────────────────────────────

    const handleRowClick = (row: BhavItem) => {
        router.visit(
            route("role.categories.bhavs.pads.show", {
                rolePrefix,
                bhav: row.id,
            }),
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Delete single
    // ─────────────────────────────────────────────────────────────────────────

    const onClickDelete = (row: BhavItem) => {
        setItem(row);
        setDeleteModal(true);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────

    const handleSearch = (value: string) => {
        setSearch(value);

        router.get(
            route("role.category.bhavlist", {
                rolePrefix,
            }),
            {
                search: value || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Select all
    // ─────────────────────────────────────────────────────────────────────────

    const checkedAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                const allIds = data.map((row) => Number(row.id));

                setSelectedIds(allIds);
                setIsMultiDeleteButton(allIds.length > 0);
            } else {
                setSelectedIds([]);
                setIsMultiDeleteButton(false);
            }
        },
        [data],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Delete single
    // ─────────────────────────────────────────────────────────────────────────

    const handleDelete = (deleteRelatedPads: boolean = false) => {
        if (!item) return;

        router.delete(
            route("role.bhav.destroy", {
                rolePrefix,
                id: item.id,
            }),
            {
                data: {
                    delete_related_pads: deleteRelatedPads ? 1 : 0,
                },

                preserveScroll: true,

                onSuccess: () => {
                    setDeleteModal(false);
                },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Bulk delete
    // ─────────────────────────────────────────────────────────────────────────

    const deleteMultiple = (deleteRelatedPads: boolean = false) => {
        if (!selectedIds.length) {
            return;
        }

        router.post(
            route("role.bhavs.bulk-destroy", {
                rolePrefix,
            }),
            {
                ids: selectedIds,
                delete_related_pads: deleteRelatedPads ? 1 : 0,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedIds([]);

                    setIsMultiDeleteButton(false);

                    setDeleteModalMulti(false);
                },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Columns
    // ─────────────────────────────────────────────────────────────────────────

    const columns = useMemo(
        () => [
            // ────────────────────────────────────────────────────────────────
            // Checkbox
            // ────────────────────────────────────────────────────────────────

            ...(canDelete
                ? [
                      {
                          header: (
                              <input
                                  type="checkbox"
                                  id="checkBoxAll"
                                  className="form-check-input"
                                  checked={
                                      data.length > 0 &&
                                      selectedIds.length === data.length
                                  }
                                  onChange={(e) => checkedAll(e.target.checked)}
                              />
                          ),

                          cell: (cellProps: any) => {
                              const id = Number(cellProps.row.original.id);

                              return (
                                  <input
                                      type="checkbox"
                                      className="form-check-input"
                                      value={id}
                                      checked={selectedIds.includes(id)}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                          setSelectedIds((prev) => {
                                              const updated = e.target.checked
                                                  ? [...prev, id]
                                                  : prev.filter(
                                                        (x) => x !== id,
                                                    );

                                              setIsMultiDeleteButton(
                                                  updated.length > 0,
                                              );

                                              return updated;
                                          });
                                      }}
                                  />
                              );
                          },

                          id: "#",
                      },
                  ]
                : []),

            // ────────────────────────────────────────────────────────────────
            // ID
            // ────────────────────────────────────────────────────────────────

            {
                header: labels.id,

                accessorKey: "id",

                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span className="fw-medium text-primary">
                        #{gujaratiNumber(cellProps.getValue(), locale)}
                    </span>
                ),
            },

            // ────────────────────────────────────────────────────────────────
            // Bhav
            // ────────────────────────────────────────────────────────────────

            {
                header: labels.value,

                accessorKey: "value",

                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const raw = cellProps.row.original.value;

                    const display = tValue(raw, locale);

                    return (
                        <span
                            className="text-muted"
                            style={{
                                fontSize: "13px",
                            }}
                        >
                            {display || "—"}
                        </span>
                    );
                },
            },

            // ────────────────────────────────────────────────────────────────
            // Pads count
            // ────────────────────────────────────────────────────────────────

            {
                header: labels.padsCount,

                accessorKey: "pads_count",

                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const count = cellProps.row.original.pads_count ?? 0;

                    return (
                        <span className="badge bg-info-subtle text-info">
                            {gujaratiNumber(count, locale)}
                        </span>
                    );
                },
            },

            // ────────────────────────────────────────────────────────────────
            // Created date
            // ────────────────────────────────────────────────────────────────

            {
                header: labels.createdAt,

                accessorKey: "created_at",

                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const value = cellProps.getValue();

                    if (!value) {
                        return <span className="text-muted">—</span>;
                    }

                    const formattedDate = new Date(value)
                        .toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })
                        .replace(/\//g, "-");

                    return (
                        <span className="text-muted">
                            {gujaratiNumber(formattedDate, locale)}
                        </span>
                    );
                },
            },

            // ────────────────────────────────────────────────────────────────
            // Actions
            // ────────────────────────────────────────────────────────────────

            {
                header: labels.actions,

                cell: (cellProps: any) => {
                    const row = cellProps.row.original;

                    return (
                        <div onClick={(e) => e.stopPropagation()}>
                            <Dropdown>
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
                                                    route(
                                                        "role.categories.bhavs.pads.show",
                                                        {
                                                            rolePrefix,
                                                            bhav: row.id,
                                                        },
                                                    ),
                                                )
                                            }
                                        >
                                            <i className="ri-eye-fill align-bottom me-2 text-muted"></i>

                                            {translations.view ?? ""}
                                        </Dropdown.Item>
                                    </li>

                                    {/* Edit */}

                                    {canEdit && (
                                        <li>
                                            <Dropdown.Item
                                                onClick={() => handleEdit(row)}
                                            >
                                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>

                                                {translations.edit ?? ""}
                                            </Dropdown.Item>
                                        </li>
                                    )}

                                    {/* Delete */}

                                    {canDelete && (
                                        <li>
                                            <Dropdown.Item
                                                className="remove-item-btn"
                                                onClick={() =>
                                                    onClickDelete(row)
                                                }
                                            >
                                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>

                                                {translations.delete ?? ""}
                                            </Dropdown.Item>
                                        </li>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    );
                },
            },
        ],
        [
            labels,
            locale,
            checkedAll,
            selectedIds,
            data,
            canDelete,
            canEdit,
            rolePrefix,
            translations,
        ],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <React.Fragment>
            <Head
                title={
                    translations.bhavs_list_title ?? translations.bhavs ?? ""
                }
            />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={
                            translations.bhavs_list_title ??
                            translations.bhavs ??
                            ""
                        }
                        pageTitle={
                            translations.bhavs_page_title ??
                            translations.bhavs ??
                            ""
                        }
                    />

                    {/* ─────────────────────────────────────────────────────
                        Single Delete Modal
                    ───────────────────────────────────────────────────── */}

                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() => setDeleteModal(false)}
                        showPadsOption={true}
                    />

                    {/* ─────────────────────────────────────────────────────
                        Bulk Delete Modal
                    ───────────────────────────────────────────────────── */}

                    <DeleteModal
                        show={deleteModalMulti}
                        onDeleteClick={(deleteRelatedPads) => {
                            deleteMultiple(deleteRelatedPads);
                        }}
                        onCloseClick={() => setDeleteModalMulti(false)}
                        showPadsOption={true}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                {/* ─────────────────────────────────────────
                                    Header
                                ───────────────────────────────────────── */}

                                <Card.Header className="border-0">
                                    <div className="d-flex align-items-center">
                                        <h5 className="card-title mb-0 flex-grow-1">
                                            {translations.bhav ??
                                                translations.bhavs ??
                                                ""}
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
                                                                    "role.category.bhavform",
                                                                    {
                                                                        rolePrefix,
                                                                    },
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <i className="ri-add-line align-bottom"></i>{" "}
                                                        {
                                                            translations.create_bhav
                                                        }
                                                    </button>
                                                )}

                                                {/* Bulk Delete */}

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

                                <Card.Body className="pt-0">
                                    {/* ─────────────────────────────────────
                                        Search
                                    ───────────────────────────────────── */}

                                    <div className="d-flex justify-content-end mb-3">
                                        <input
                                            type="search"
                                            className="form-control"
                                            style={{
                                                maxWidth: 280,
                                            }}
                                            placeholder={
                                                translations.search_bhav_placeholder ??
                                                ""
                                            }
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

                                    {/* ─────────────────────────────────────
                                        Table
                                    ───────────────────────────────────── */}

                                    {data && data.length > 0 ? (
                                        <>
                                            <TableContainer
                                                columns={columns}
                                                data={data}
                                                isGlobalFilter={false}
                                                customPageSize={10}
                                                divClass="table-responsive table-card mb-3"
                                                tableClass="align-middle table-nowrap mb-0"
                                                theadClass=""
                                                thClass=""
                                                SearchPlaceholder={
                                                    translations.search_bhav_placeholder ??
                                                    ""
                                                }
                                                onSearch={handleSearch}
                                                onRowClick={handleRowClick}
                                            />

                                            {/* ─────────────────────────────
                                                Pagination
                                            ───────────────────────────── */}

                                            {bhavs.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {translations.showing}{" "}
                                                        {gujaratiNumber(
                                                            data.length,
                                                            locale,
                                                        )}{" "}
                                                        {translations.of}{" "}
                                                        {gujaratiNumber(
                                                            bhavs.total,
                                                            locale,
                                                        )}{" "}
                                                        {translations.results}
                                                    </small>

                                                    <ul className="pagination pagination-sm mb-0">
                                                        {bhavs.links.map(
                                                            (
                                                                link: any,
                                                                idx: number,
                                                            ) => (
                                                                <li
                                                                    key={idx}
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
                                                {translations.no_bhavs_found}
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

BhavList.layout = (page: any) => <Layout children={page} />;

export default BhavList;
