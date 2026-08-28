import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";
import TableContainer from "../../../Components/Common/TableContainer";
import { Head, Link, router, usePage } from "@inertiajs/react";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../../Components/Common/Loader";
import Layout from "../../../Layouts";
import { gujaratiNumber } from "../../../utils/number";
import { useAlphabetFilter } from "../../../hooks/useAlphabetFilter";
import AlphabetFilter from "../../../Components/Common/AlphabetFilter";
import { usePermission } from "../../../hooks/usePermission";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pad {
    id: number;
    kirtan_id: number;
    title: string;
    value: string;
    status: string;
    created_at: string;
    establish_date?: string | null;
    kirtan?: { id: number; title: string };
}

interface PaginatedPads {
    data: Pad[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    pads: PaginatedPads;
    filters: {
        search?: string;
        status?: string;
        letter?: string;
    };
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, isGu }: { status: string; isGu: boolean }) => {
    const key = (status || "").toLowerCase();

    // map status → display label
    const classMap: Record<string, string> = {
        published: "badge bg-success-subtle text-success text-uppercase",
        save: "badge bg-success-subtle text-success text-uppercase",
        draft: "badge bg-warning-subtle text-warning text-uppercase",
    };

    let label = status || "—";
    if (key === "save" || key === "published") {
        label = isGu ? "પ્રકાશિત" : "Published";
    } else if (key === "draft") {
        label = isGu ? "ડ્રાફ્ટ" : "Draft";
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

// Strip long lyrics down to a short preview for the table cell
const truncate = (text: string, len = 60) => {
    if (!text) return "";
    return text.length > len ? `${text.slice(0, len)}…` : text;
};

// ─── Component ────────────────────────────────────────────────────────────────
const translations = {
    en: {
        createPad: "Create Pad",
    },
    gu: {
        createPad: "પદ બનાવો",
    },
};

const PadList: React.FC<Props> = ({ pads, filters }) => {
    const page = usePage().props as { locale?: string };
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const isGu = locale === "gu";

    // ── Permission checks ──────────────────────────────────────────────
    const { can } = usePermission();
    const canCreate = can("pads", "create");
    const canEdit = can("pads", "edit");
    const canDelete = can("pads", "delete");

    const [padData, setPadData] = useState<Pad[]>(pads?.data ?? []);
    // Filters
    const [search, setSearch] = useState(filters?.search ?? "");
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? "");
    // Delete
    const [pad, setPad] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);
    const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<
        number[]
    >([]);
    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    const { selectedLetter, handleLetterFilter } = useAlphabetFilter(
        "role.pads.list",
        {
            rolePrefix: rolePrefix,
            search: search || undefined,
            status: statusFilter || undefined,
            per_page: 10,
        },
    );

    // Sync prop changes
    useEffect(() => {
        setSearch(filters?.search ?? "");
        setStatusFilter(filters?.status ?? "");
    }, [filters]);

    useEffect(() => {
        if (pads?.data) {
            setPadData(pads.data);
        }
    }, [pads]);

    const labels = {
        en: {
            id: "ID",
            title: "Pad Title",
            lyrics: "Lyrics",
            status: "Status",
            createdAt: "Created At",
            actions: "Actions",
        },
        gu: {
            id: "ક્રમ",
            title: "પદ શીર્ષક",
            lyrics: "ગીતો",
            status: "સ્થિતિ",
            createdAt: "બનાવ્યાની તારીખ",
            actions: "ક્રિયાઓ",
        },
    }[locale];

    const handleSearch = (value: string) => {
        setSearch(value);

        router.get(
            route("role.pads.list", {
                rolePrefix: rolePrefix,
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

    // const handleEdit = (row: Pad) => {
    //     router.visit(route("admin.pads.edit", row.id));
    // };
    const handleEdit = (row: Pad) => {
        router.visit(
            route("role.pads.edit", {
                rolePrefix: rolePrefix,
                pad: row.id,
            }),
        );
    };

    const handleRowClick = (row: Pad) => {
        router.visit(
            route("role.pads.show", {
                rolePrefix: rolePrefix,
                pad: row.id,
            }),
        );
    };

    // Delete
    const onClickDelete = (item: Pad) => {
        setPad(item);
        setDeleteModal(true);
    };

    // Checked All
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

    const handleDeletePad = () => {
        if (pad) {
            router.delete(
                route("role.pads.destroy", {
                    rolePrefix: rolePrefix,
                    pad: pad.id,
                }),
                {
                    onSuccess: () => {
                        setDeleteModal(false);

                        toast.success(
                            isGu
                                ? "પદ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું."
                                : "Pad deleted successfully",
                        );
                    },
                },
            );
        }
    };

    // Delete Multiple
    const deleteMultiple = () => {
        const ids = selectedCheckBoxDelete;

        if (!ids.length) {
            toast.warning(
                isGu
                    ? "ઓછામાં ઓછું એક પદ પસંદ કરો."
                    : "Select at least one pad.",
            );
            return;
        }

        router.post(
            route("role.pads.bulk-destroy", {
                rolePrefix,
            }),
            { ids },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        isGu
                            ? "પદો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા."
                            : "Pads deleted successfully.",
                    );

                    setSelectedCheckBoxDelete([]);
                    setIsMultiDeleteButton(false);
                },
                onError: () => {
                    toast.error(
                        isGu
                            ? "પદો કાઢી નાખવામાં નિષ્ફળતા."
                            : "Failed to delete pads.",
                    );
                },
            },
        );
    };

    const columns = useMemo(
        () => [
            ...(canDelete
                ? [
                      {
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
                          id: "#",
                      },
                  ]
                : []),
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
            {
                header: labels.title,
                accessorKey: "title",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <span className="text-body fw-semibold">
                        {cellProps.getValue()}
                    </span>
                ),
            },
            {
                header: labels.lyrics,
                accessorKey: "value",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <span className="text-muted" style={{ fontSize: "13px" }}>
                        {truncate(cellProps.getValue())}
                    </span>
                ),
            },
            // ─── Recording column ─────────────────────────────────────────────

            ...(canEdit
                ? [
                      {
                          header: labels.status,
                          accessorKey: "status",
                          enableColumnFilter: false,
                          cell: (cellProps: any) => (
                              <StatusBadge
                                  status={cellProps.getValue()}
                                  isGu={isGu}
                              />
                          ),
                      },
                  ]
                : []),
            {
                header: labels.createdAt,
                accessorKey: "created_at",
                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const formattedDate = new Date(cellProps.getValue())
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
            {
                header: labels.actions,
                cell: (cellProps: any) => (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Dropdown>
                            <Dropdown.Toggle
                                as="a"
                                className="btn btn-soft-secondary btn-sm arrow-none"
                            >
                                <i className="ri-more-fill align-middle"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-end">
                                {/* View – always show if user can see the list */}
                                <li>
                                    <Dropdown.Item
                                        href={route("role.pads.show", {
                                            rolePrefix: rolePrefix,
                                            pad: cellProps.row.original.id,
                                        })}
                                    >
                                        <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                                        {isGu ? "જુઓ" : "View"}
                                    </Dropdown.Item>
                                </li>

                                {/* Edit – only if has edit permission */}
                                {canEdit && (
                                    <li>
                                        <Dropdown.Item
                                            onClick={() =>
                                                handleEdit(
                                                    cellProps.row.original,
                                                )
                                            }
                                        >
                                            <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                                            {isGu ? "ફેરફાર કરો" : "Edit"}
                                        </Dropdown.Item>
                                    </li>
                                )}

                                {/* Delete – only if has delete permission */}
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
                                            {isGu ? "કાઢી નાખો" : "Delete"}
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
            labels,
            locale,
            isGu,
            checkedAll,
            selectedCheckBoxDelete,
            padData,
            canDelete,
            canEdit,
        ],
    );

    return (
        <React.Fragment>
            <Head title={isGu ? "પદોની યાદી" : "Pads list"} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={isGu ? "પદોની યાદી" : "Pads List"}
                        pageTitle={isGu ? "પદો" : "Pads"}
                    />

                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDeletePad}
                        onCloseClick={() => setDeleteModal(false)}
                    />
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
                                <Card.Header className="border-0">
                                    <div className="d-flex align-items-center">
                                        <h5 className="card-title mb-0 flex-grow-1">
                                            {isGu ? "પદો" : "Pads"}
                                        </h5>
                                        <div className="flex-shrink-0">
                                            <div className="d-flex flex-wrap gap-2">
                                                {canCreate && (
                                                    <button
                                                        className="btn btn-danger add-btn"
                                                        onClick={() =>
                                                            router.visit(
                                                                route(
                                                                    "role.pads.create",
                                                                    {
                                                                        rolePrefix:
                                                                            rolePrefix,
                                                                    },
                                                                ),
                                                                {
                                                                    data: {
                                                                        locale,
                                                                    },
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <i className="ri-add-line align-bottom"></i>{" "}
                                                        {
                                                            translations[locale]
                                                                .createPad
                                                        }
                                                    </button>
                                                )}
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
                                    {/* Search */}
                                    <div className="d-flex justify-content-end mb-3">
                                        <input
                                            type="search"
                                            className="form-control"
                                            style={{ maxWidth: 280 }}
                                            placeholder={
                                                isGu
                                                    ? "પદ શીર્ષક, ગીતો, ગાયક... શોધો"
                                                    : "Search title, lyrics, singer..."
                                            }
                                            value={search}
                                            onChange={(e) =>
                                                handleSearch(e.target.value)
                                            }
                                        />
                                    </div>

                                    {/* ========== MOBILE / TABLET Alphabet (Horizontal) ========== */}
                                    {/* <div className="d-lg-none mb-3">
                                        <div
                                            className="d-flex gap-1 overflow-auto pb-2"
                                            style={{ scrollbarWidth: "thin" }}
                                        >
                                            {alphabet.map((letter) => (
                                                <button
                                                    key={letter}
                                                    type="button"
                                                    onClick={() =>
                                                        handleLetterFilter(
                                                            letter,
                                                        )
                                                    }
                                                    className={`btn btn-sm rounded-circle flex-shrink-0 ${
                                                        selectedLetter ===
                                                        letter
                                                            ? "btn-primary"
                                                            : "btn-soft-secondary"
                                                    }`}
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        padding: 0,
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {letter}
                                                </button>
                                            ))}

                                            {selectedLetter && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleLetterFilter("")
                                                    }
                                                    className="btn btn-sm btn-soft-danger rounded-circle flex-shrink-0"
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        padding: 0,
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    </div> */}

                                    {/* ========== DESKTOP Layout ========== */}
                                    {/* <div className="d-flex gap-3"> */}
                                    {/* Table */}
                                    {/* <div
                                            className="flex-grow-1"
                                            style={{ minWidth: 0 }}
                                        >
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
                                                        onRowClick={
                                                            handleRowClick
                                                        }
                                                    />

                                                    {pads.last_page > 1 && (
                                                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-2">
                                                            <small className="text-muted">
                                                                Showing{" "}
                                                                {padData.length}{" "}
                                                                of {pads.total}{" "}
                                                                results
                                                            </small>
                                                            <ul className="pagination pagination-sm mb-0">
                                                                {pads.links.map(
                                                                    (
                                                                        link,
                                                                        idx,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className={`page-item ${link.active ? "active" : ""} ${!link.url ? "disabled" : ""}`}
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
                                                        {isGu
                                                            ? "કોઈ પદ મળ્યું નથી."
                                                            : "No pads found."}
                                                    </div>
                                                </div>
                                            )}
                                        </div> */}

                                    {/* ========== DESKTOP Alphabet (Vertical Sticky) ========== */}
                                    {/* <div
                                            className="d-none d-lg-flex flex-column align-items-center gap-1"
                                            style={{
                                                position: "sticky",
                                                top: 100,
                                                maxHeight:
                                                    "calc(100vh - 180px)", // ← important
                                                overflowY: "auto", // ← enables scroll
                                                height: "fit-content",
                                                minWidth: isGu ? 42 : 36,
                                            }}
                                        >
                                            {alphabet.map((letter) => (
                                                <button
                                                    key={letter}
                                                    type="button"
                                                    onClick={() =>
                                                        handleLetterFilter(
                                                            letter,
                                                        )
                                                    }
                                                    className={`btn btn-sm rounded-circle ${
                                                        selectedLetter ===
                                                        letter
                                                            ? "btn-primary"
                                                            : "btn-soft-secondary"
                                                    }`}
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        minWidth: 36,
                                                        minHeight: 36,
                                                        padding: 0,
                                                        borderRadius: "50%", // ← forces perfect circle
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        lineHeight: 1,
                                                    }}
                                                    title={letter}
                                                >
                                                    {letter}
                                                </button>
                                            ))}

                                            {selectedLetter && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleLetterFilter("")
                                                    }
                                                    className="btn btn-sm btn-soft-danger rounded-circle mt-2"
                                                    style={{
                                                        width: isGu ? 38 : 32,
                                                        height: isGu ? 38 : 32,
                                                        padding: 0,
                                                        fontSize: 16,
                                                    }}
                                                    title={
                                                        isGu
                                                            ? "ફિલ્ટર સાફ કરો"
                                                            : "Clear filter"
                                                    }
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div> */}

                                    {/* </div> */}

                                    {/* FOR ALL DEVICE SHOW THIS LAYOUT */}
                                    {/* ========== Alphabet - Horizontal on ALL screens ========== */}
                                    <AlphabetFilter
                                        selectedLetter={selectedLetter}
                                        onSelect={handleLetterFilter}
                                    />

                                    {/* ========== Table ========== */}
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

                                                {pads.last_page > 1 && (
                                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-2">
                                                        <small className="text-muted">
                                                            Showing{" "}
                                                            {padData.length} of{" "}
                                                            {pads.total} results
                                                        </small>
                                                        <ul className="pagination pagination-sm mb-0">
                                                            {pads.links.map(
                                                                (link, idx) => (
                                                                    <li
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className={`page-item ${link.active ? "active" : ""} ${!link.url ? "disabled" : ""}`}
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
                                                    {isGu
                                                        ? "કોઈ પદ મળ્યું નથી."
                                                        : "No pads found."}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <ToastContainer
                                        closeButton={false}
                                        limit={1}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

PadList.layout = (page: any) => <Layout children={page} />;
export default PadList;
