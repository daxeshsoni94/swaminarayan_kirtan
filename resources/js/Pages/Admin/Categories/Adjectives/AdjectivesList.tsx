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
// Resolve multilingual database value → string
//
// Example:
// { en: "Ahmedabad", gu: "અમદાવાદ" }
//
// Current locale:
// en → Ahmedabad
// gu → અમદાવાદ
//
// Fallback:
// current locale → en → gu → first available language
// ─────────────────────────────────────────────────────────────────────────────

const tValue = (value: any, locale: string): string => {
    if (value == null) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        const currentValue = value[locale];

        if (typeof currentValue === "string" && currentValue.trim() !== "") {
            return currentValue;
        }

        const fallback = Object.values(value).find(
            (item: any) => typeof item === "string" && item.trim() !== "",
        );

        return typeof fallback === "string" ? fallback : "";
    }

    return String(value);
};
// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const AdjectivesList = ({ adjectives, filters }: any) => {
    // ─────────────────────────────────────────────────────────────────────────
    // Page / translations
    // ─────────────────────────────────────────────────────────────────────────

    const page = usePage().props as any;

    const { auth, translations, languages = [] } = page;

    const locale = page.locale || "en";

    const t = translations || {};

    // ─────────────────────────────────────────────────────────────────────────
    // Role
    // ─────────────────────────────────────────────────────────────────────────

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    // ─────────────────────────────────────────────────────────────────────────
    // Permissions
    // ─────────────────────────────────────────────────────────────────────────

    const { can } = usePermission();

    const canCreate = can("categories", "create");
    const canEdit = can("categories", "edit");
    const canDelete = can("categories", "delete");

    // ─────────────────────────────────────────────────────────────────────────
    // Data
    // ─────────────────────────────────────────────────────────────────────────

    const [data, setData] = useState(adjectives?.data ?? []);

    // ─────────────────────────────────────────────────────────────────────────
    // Delete state
    // ─────────────────────────────────────────────────────────────────────────

    const [item, setItem] = useState<any>(null);

    const [deleteModal, setDeleteModal] = useState(false);

    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────

    const [search, setSearch] = useState(filters?.search ?? "");

    const { selectedLetter, handleLetterFilter } = useAlphabetFilter(
        "role.category.adjectivelist",
        {
            rolePrefix,
            search: search || undefined,
            per_page: 10,
            locale,
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
        if (adjectives?.data) {
            setData(adjectives.data);
        }
    }, [adjectives]);

    // ─────────────────────────────────────────────────────────────────────────
    // Column labels
    // ─────────────────────────────────────────────────────────────────────────

    const labels = useMemo(
        () => ({
            id: t.id,
            value: t.adjective,
            padsCount: t.total_pads,
            createdAt: t.created_at,
            actions: t.actions,
        }),
        [t],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Edit
    // ─────────────────────────────────────────────────────────────────────────

    const handleEdit = (row: any) => {
        router.visit(
            route("role.adjectives.edit", {
                rolePrefix,
                adjective: row.id,
            }),
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Row click
    // ─────────────────────────────────────────────────────────────────────────

    const handleRowClick = (row: any) => {
        router.visit(
            route("role.adjectives.pads.show", {
                rolePrefix,
                adjective: row.id,
            }),
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Delete single
    // ─────────────────────────────────────────────────────────────────────────

    const onClickDelete = (row: any) => {
        setItem(row);
        setDeleteModal(true);
    };

    const handleDelete = (deleteRelatedPads: boolean = false) => {
        if (!item) {
            return;
        }

        router.delete(
            route("role.adjectives.destroy", {
                rolePrefix,
                adjective: item.id,
            }),
            {
                data: {
                    delete_related_pads: deleteRelatedPads ? 1 : 0,
                },

                preserveScroll: true,

                onSuccess: () => {
                    setDeleteModal(false);

                    // toast.success(t.adjective_deleted_success);
                },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Bulk delete
    // ─────────────────────────────────────────────────────────────────────────

    const deleteMultiple = (deleteRelatedPads: boolean = false) => {
        if (!selectedIds.length) {
            // toast.warning(t.select_at_least_one_adjective);

            return;
        }

        router.post(
            route("role.adjectives.bulk-destroy", {
                rolePrefix,
            }),
            {
                ids: selectedIds,

                delete_related_pads: deleteRelatedPads ? 1 : 0,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    // toast.success(t.adjectives_deleted_success);

                    setSelectedIds([]);

                    setIsMultiDeleteButton(false);

                    setDeleteModalMulti(false);
                },

                onError: () => {
                    // toast.error(t.adjectives_delete_failed);
                },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────

    const handleSearch = (value: string) => {
        setSearch(value);

        router.get(
            route("role.category.adjectivelist", {
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
                const allIds = data.map((row: any) => Number(row.id));

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
            // Adjective value
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
                    const formattedDate = new Date(cellProps.getValue())
                        .toLocaleDateString(locale, {
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
                                    <i className="ri-more-fill align-middle" />
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="dropdown-menu-end">
                                    {/* View */}

                                    <li>
                                        <Dropdown.Item
                                            onClick={() =>
                                                router.visit(
                                                    route(
                                                        "role.adjectives.pads.show",
                                                        {
                                                            rolePrefix,
                                                            adjective: row.id,
                                                        },
                                                    ),
                                                )
                                            }
                                        >
                                            <i className="ri-eye-fill align-bottom me-2 text-muted" />

                                            {t.view}
                                        </Dropdown.Item>
                                    </li>

                                    {/* Edit */}

                                    {canEdit && (
                                        <li>
                                            <Dropdown.Item
                                                onClick={() => handleEdit(row)}
                                            >
                                                <i className="ri-pencil-fill align-bottom me-2 text-muted" />

                                                {t.edit}
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
                                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />

                                                {t.delete}
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
        ],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <React.Fragment>
            <Head title={t.adjectives_list} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={t.adjectives_list}
                        pageTitle={t.adjectives}
                    />

                    {/* Single Delete Modal */}

                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() => setDeleteModal(false)}
                        showPadsOption={true}
                    />

                    {/* Bulk Delete Modal */}

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
                                {/* Header */}

                                <Card.Header className="border-0">
                                    <div className="d-flex align-items-center">
                                        <h5 className="card-title mb-0 flex-grow-1">
                                            {t.adjectives}
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
                                                                    "role.category.adjectiveform",
                                                                    {
                                                                        rolePrefix,
                                                                    },
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <i className="ri-add-line align-bottom" />{" "}
                                                        {t.create_adjective}
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
                                                            <i className="ri-delete-bin-2-line" />
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
                                            style={{
                                                maxWidth: 280,
                                            }}
                                            placeholder={
                                                t.adjective_search_placeholder
                                            }
                                            value={search}
                                            onChange={(e) =>
                                                handleSearch(e.target.value)
                                            }
                                        />
                                    </div>

                                    {/* Alphabet filter */}

                                    <AlphabetFilter
                                        selectedLetter={selectedLetter}
                                        onSelect={handleLetterFilter}
                                    />

                                    {/* Table */}

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
                                                    t.adjective_search_placeholder
                                                }
                                                onSearch={handleSearch}
                                                onRowClick={handleRowClick}
                                            />

                                            {/* Pagination */}

                                            {adjectives.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {t.showing}{" "}
                                                        {gujaratiNumber(
                                                            data.length,
                                                            locale,
                                                        )}{" "}
                                                        {t.of}{" "}
                                                        {gujaratiNumber(
                                                            adjectives.total,
                                                            locale,
                                                        )}{" "}
                                                        {t.results}
                                                    </small>

                                                    <ul className="pagination pagination-sm mb-0">
                                                        {adjectives.links.map(
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
                                                {t.no_adjectives_found}
                                            </div>
                                        </div>
                                    )}

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

AdjectivesList.layout = (page: any) => <Layout children={page} />;

export default AdjectivesList;
