// resources/js/Pages/Admin/Creators/List.jsx
// (or Categories/List.jsx — adjust route names to match your backend)

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";
import TableContainer from "../../../../Components/Common/TableContainer";
import { Head, Link, router, usePage } from "@inertiajs/react";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../../Components/Common/DeleteModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../../../../Layouts";
import { gujaratiNumber } from "../../../../utils/number";
import { useAlphabetFilter } from "../../../../hooks/useAlphabetFilter";
import AlphabetFilter from "../../../../Components/Common/AlphabetFilter";
import { usePermission } from "../../../../hooks/usePermission";
import { categories } from "../../../../common/data/jobLanding";

// ── Resolve translation object → string (same as Edit / Show) ─────────────────
const t = (v: any, locale = "en"): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
        return v[locale] ?? v.en ?? v.gu ?? Object.values(v)[0] ?? "";
    }
    return String(v);
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Creator {
    id: number;
    type: string | { en?: string; gu?: string }; // e.g. {"en":"Creator"} or "Creator"
    value: string | { en?: string; gu?: string }; // e.g. {"en":"Bramhanand swami"}
    created_by?: number;
    created_at: string;
    updated_at?: string;
}

interface PaginatedCreators {
    data: Creator[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    creators: PaginatedCreators; // rename to `categories` if your controller sends that
    filters?: {
        search?: string;
        type?: string;
        letter?: string;
    };
}

interface Creator {
    id: number;
    type: string | { en?: string; gu?: string };
    value: string | { en?: string; gu?: string };
    pads_count?: number; // ← from withCount('pads')
    created_by?: number;
    created_at: string;
    updated_at?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const translations = {
    en: {
        create: "Create Creator",
        title: "Creators List",
        pageTitle: "Creators",
        searchPlaceholder: "Search by value…",
        noData: "No creators found.",
        deleteSuccess: "Creator deleted successfully",
        bulkDeleteSuccess: "Creators deleted successfully.",
        bulkDeleteFail: "Failed to delete creators.",
        selectAtLeastOne: "Select at least one item.",
        view: "View",
        edit: "Edit",
        delete: "Delete",
        showing: "Showing",
        of: "of",
        results: "results",
    },
    gu: {
        create: " બનાવો",
        title: "રચયિતા યાદી",
        pageTitle: "રચયિતા",
        searchPlaceholder: "રચયિતા શોધો…",
        noData: "કોઈ રચયિતા મળ્યા નથી.",
        deleteSuccess: "રચયિતા સફળતાપૂર્વક કાઢી નાખ્યું",
        bulkDeleteSuccess: "રચયિતા સફળતાપૂર્વક કાઢી નાખ્યા.",
        bulkDeleteFail: "રચયિતા કાઢી નાખવામાં નિષ્ફળતા.",
        selectAtLeastOne: "ઓછામાં ઓછું એક આઇટમ પસંદ કરો.",
        view: "જુઓ",
        edit: "ફેરફાર કરો",
        delete: "કાઢી નાખો",
        showing: "બતાવી રહ્યા છીએ",
        of: "માંથી",
        results: "પરિણામો",
    },
};

const CreatorList: React.FC<Props> = ({ creators, filters }) => {
    const page = usePage().props as { locale?: string };
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const isGu = locale === "gu";
    const tr = translations[locale];
    const { can } = usePermission();
    const canCreate = can("categories", "create");
    const canEdit = can("categories", "edit");
    const canDelete = can("categories", "delete");

    const [data, setData] = useState<Creator[]>(creators?.data ?? []);

    // Delete
    const [item, setItem] = useState<Creator | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    // Filters
    const [search, setSearch] = useState(filters?.search ?? "");
    const { selectedLetter, handleLetterFilter } = useAlphabetFilter(
        "role.category.creatorlist",
        {
            rolePrefix: rolePrefix,
            search: search || undefined,
            per_page: 10,
        },
    );
    useEffect(() => {
        setSearch(filters?.search ?? "");
    }, [filters?.search]);

    useEffect(() => {
        if (creators?.data) setData(creators.data);
    }, [creators]);

    // Column labels by locale
    const labels = {
        en: {
            id: "ID",
            type: "Type",
            value: "Creators",
            padsCount: "Total Pads",
            createdAt: "Created At",
            actions: "Actions",
        },
        gu: {
            id: "ક્રમ",
            type: "પ્રકાર",
            value: "રચયિતા",
            padsCount: "કુલ પદો",
            createdAt: "બનાવ્યાની તારીખ",
            actions: "ક્રિયાઓ",
        },
    }[locale];

    const handleEdit = (row: Creator) => {
        router.visit(
            route("role.creators.edit", {
                rolePrefix: rolePrefix,
                category: row.id,
            }),
        );
    };

    const handleRowClick = (row: Creator) => {
        router.visit(
            route("role.creators.pads.show", {
                rolePrefix: rolePrefix,
                category: row.id,
            }),
        );
    };
    const onClickDelete = (row: Creator) => {
        setItem(row);
        setDeleteModal(true);
    };

    const handleSearch = (value: string) => {
        console.log("CREATOR SEARCH:", value);

        setSearch(value);

        router.get(
            route("role.category.creatorlist", {
                rolePrefix: rolePrefix,
            }),
            {
                search: value || undefined,
                letter: selectedLetter || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };
    // Multi-select
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    const checkedAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                const allIds = data.map((r) => Number(r.id));
                setSelectedIds(allIds);
                setIsMultiDeleteButton(allIds.length > 0);
            } else {
                setSelectedIds([]);
                setIsMultiDeleteButton(false);
            }
        },
        [data],
    );

    const handleDelete = (deleteRelatedPads: boolean = false) => {
        if (!item) return;
        router.post(
            route("role.creator.destroy", {
                rolePrefix,
                id: item.id,
            }),
            {
                _method: "delete",
                delete_related_pads: deleteRelatedPads ? 1 : 0,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModal(false);
                    toast.success(tr.deleteSuccess);
                },
            },
        );
    };

    const deleteMultiple = (deleteRelatedPads: boolean = false) => {
        if (!selectedIds.length) {
            toast.warning(tr.selectAtLeastOne);
            return;
        }
        router.post(
            route("role.creators.bulk-destroy", {
                rolePrefix: rolePrefix,
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
                    toast.success(tr.bulkDeleteSuccess);
                },
                onError: () => toast.error(tr.bulkDeleteFail),
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
                                      data.length > 0 &&
                                      selectedIds.length === data.length
                                  }
                                  onChange={(e) => checkedAll(e.target.checked)}
                              />
                          ),
                          cell: (cellProps: any) => (
                              <input
                                  type="checkbox"
                                  className="form-check-input"
                                  value={cellProps.row.original.id}
                                  checked={selectedIds.includes(
                                      Number(cellProps.row.original.id),
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                      const id = Number(
                                          cellProps.row.original.id,
                                      );
                                      setSelectedIds((prev) => {
                                          const updated = e.target.checked
                                              ? [...prev, id]
                                              : prev.filter((x) => x !== id);
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
                // ── Value resolved by locale ──────────────────────────────────
                header: labels.value,
                accessorKey: "value",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const raw = cellProps.row.original.value;
                    const display = t(raw, locale); // e.g. "Bramhanand swami"
                    return (
                        <span
                            className="text-muted"
                            style={{ fontSize: "13px" }}
                        >
                            {display || "—"}
                        </span>
                    );
                },
            },
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
                                <li>
                                    <Dropdown.Item
                                        href={route("role.creators.pads.show", {
                                            rolePrefix: rolePrefix,
                                            category: cellProps.row.original.id,
                                        })}
                                    >
                                        {/* <Dropdown.Item
                                            href={route("role.pads.show", {
                                                rolePrefix: rolePrefix,
                                                pad: cellProps.row.original.id,
                                            })}
                                        ></Dropdown.Item> */}
                                        <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                                        {tr.view}
                                    </Dropdown.Item>
                                </li>

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
                                            {tr.edit}
                                        </Dropdown.Item>
                                    </li>
                                )}

                                {canDelete && (
                                    <li>
                                        <Dropdown.Item
                                            className="remove-item-btn"
                                            onClick={() =>
                                                onClickDelete(
                                                    cellProps.row.original,
                                                )
                                            }
                                        >
                                            <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                            {tr.delete}
                                        </Dropdown.Item>
                                    </li>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ],
        [labels, locale, tr, checkedAll, selectedIds, data, canDelete, canEdit],
    );

    return (
        <React.Fragment>
            <Head title={tr.title} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={tr.title} pageTitle={tr.pageTitle} />

                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() => setDeleteModal(false)}
                        showPadsOption={true} // ← enable checkbox
                        isGu={isGu}
                    />
                    <DeleteModal
                        show={deleteModalMulti}
                        onDeleteClick={(deleteRelatedPads) => {
                            deleteMultiple(deleteRelatedPads);
                        }}
                        onCloseClick={() => setDeleteModalMulti(false)}
                        showPadsOption={true} // ← enable checkbox
                        isGu={isGu}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header className="border-0">
                                    <div className="d-flex align-items-center">
                                        <h5 className="card-title mb-0 flex-grow-1">
                                            {isGu ? "રચયિતા" : "Creators"}
                                        </h5>
                                        <div className="flex-shrink-0">
                                            <div className="d-flex flex-wrap gap-2">
                                                {canCreate && (
                                                    <button
                                                        className="btn btn-danger add-btn"
                                                        onClick={() =>
                                                            router.visit(
                                                                route(
                                                                    "role.creators.creatorform",
                                                                    {
                                                                        rolePrefix:
                                                                            rolePrefix,
                                                                    },
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <i className="ri-add-line align-bottom"></i>{" "}
                                                        {tr.create}
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
                                    <div className="d-flex justify-content-end mb-3">
                                        <input
                                            type="search"
                                            className="form-control"
                                            style={{ maxWidth: 280 }}
                                            placeholder={tr.searchPlaceholder}
                                            value={search}
                                            onChange={(e) =>
                                                handleSearch(e.target.value)
                                            }
                                        />
                                    </div>
                                    <AlphabetFilter
                                        selectedLetter={selectedLetter}
                                        onSelect={handleLetterFilter}
                                    />
                                    {/* Locale indicator (optional, same as Show/Edit) */}
                                    {/* <div className="mb-2">
                                        <span className="badge bg-primary">
                                            {isGu
                                                ? "જોવું: ગુજરાતી (GU)"
                                                : "Viewing: English (EN)"}
                                        </span>
                                        <small className="text-muted ms-2">
                                            Switch language from the header
                                            toggle.
                                        </small>
                                    </div> */}

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
                                                    tr.searchPlaceholder
                                                }
                                                onSearch={handleSearch}
                                                onRowClick={handleRowClick}
                                            />

                                            {creators.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr.showing}{" "}
                                                        {data.length} {tr.of}{" "}
                                                        {creators.total}{" "}
                                                        {tr.results}
                                                    </small>
                                                    <ul className="pagination pagination-sm mb-0">
                                                        {creators.links.map(
                                                            (link, idx) => (
                                                                <li
                                                                    key={idx}
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
                                                {tr.noData}
                                            </div>
                                        </div>
                                    )}
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

CreatorList.layout = (page: any) => <Layout children={page} />;
export default CreatorList;
