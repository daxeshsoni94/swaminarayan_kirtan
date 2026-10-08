import React, { useEffect, useMemo, useState, useCallback } from "react";

import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";

import TableContainer from "../../../../Components/Common/TableContainer";

import { Head, router, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import DeleteModal from "../../../../Components/Common/DeleteModal";

import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import Layout from "../../../../Layouts";

import { gujaratiNumber } from "../../../../utils/number";

import { useAlphabetFilter } from "../../../../hooks/useAlphabetFilter";

import AlphabetFilter from "../../../../Components/Common/AlphabetFilter";

import { usePermission } from "../../../../hooks/usePermission";

/**
 * Resolve multilingual database value.
 *
 * Example:
 * {
 *     en: "Ahmedabad",
 *     gu: "અમદાવાદ"
 * }
 *
 * Returns the value for the current locale.
 */
const tValue = (value: any, locale: string): string => {
    if (value == null) return "";

    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "object") {
        return (
            value?.[locale] ??
            Object.values(value).find(
                (item) => typeof item === "string" && item.trim() !== "",
            ) ??
            ""
        );
    }

    return String(value);
};

/**
 * Centralized translation helper.
 *
 * Supports:
 * tr("places")
 * tr("total_places", { count: 10 })
 */
const createTranslator = (translations: Record<string, any>) => {
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

interface PlaceItem {
    id: number;
    type?: string | Record<string, string>;
    value?: string | Record<string, string>;
    pads_count?: number;
    created_by?: number;
    created_at: string;
    updated_at?: string;
}

interface PaginatedPlaces {
    data: PlaceItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

interface PlaceListProps {
    places: PaginatedPlaces;
    filters?: {
        search?: string;
    };
}

const PlaceList = ({ places, filters }: PlaceListProps) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale, languages = [] } = page;

    /**
     * Current locale comes from Laravel/Inertia.
     *
     * No hardcoded en/gu switching.
     */
    const currentLocale = locale || "gu";

    /**
     * Centralized translator.
     */
    const tr = useMemo(() => createTranslator(translations), [translations]);

    /**
     * Dynamic role prefix.
     */
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const { can } = usePermission();

    const canCreate = can("categories", "create");
    const canEdit = can("categories", "edit");
    const canDelete = can("categories", "delete");

    const [data, setData] = useState<PlaceItem[]>(places?.data ?? []);

    // ─────────────────────────────────────────────────────────────
    // Delete state
    // ─────────────────────────────────────────────────────────────

    const [item, setItem] = useState<PlaceItem | null>(null);

    const [deleteModal, setDeleteModal] = useState(false);

    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    // ─────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────

    const [search, setSearch] = useState(filters?.search ?? "");

    const { selectedLetter, handleLetterFilter } = useAlphabetFilter(
        "role.category.placelist",
        {
            rolePrefix,
            search: search || undefined,
            per_page: 10,
        },
    );

    // ─────────────────────────────────────────────────────────────
    // Selected IDs
    // ─────────────────────────────────────────────────────────────

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    // ─────────────────────────────────────────────────────────────
    // Update local data when Inertia receives new props
    // ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (places?.data) {
            setData(places.data);
        }
    }, [places]);

    // ─────────────────────────────────────────────────────────────
    // Edit
    // ─────────────────────────────────────────────────────────────

    const handleEdit = (row: PlaceItem) => {
        router.visit(
            route("role.place.edit", {
                rolePrefix,
                place: row.id,
            }),
        );
    };

    // ─────────────────────────────────────────────────────────────
    // Row click
    // ─────────────────────────────────────────────────────────────

    const handleRowClick = (row: PlaceItem) => {
        router.visit(
            route("role.places.pads.show", {
                rolePrefix,
                place: row.id,
            }),
        );
    };

    // ─────────────────────────────────────────────────────────────
    // Delete single
    // ─────────────────────────────────────────────────────────────

    const onClickDelete = (row: PlaceItem) => {
        setItem(row);
        setDeleteModal(true);
    };

    // ─────────────────────────────────────────────────────────────
    // Delete single
    // ─────────────────────────────────────────────────────────────

    const handleDelete = (deleteRelatedPads: boolean = false) => {
        if (!item) return;

        router.delete(
            route("role.place.destroy", {
                rolePrefix,
                id: item.id,
            }),
            {
                data: {
                    delete_related_pads: deleteRelatedPads ? 1 : 0,
                },
                preserveScroll: true,

                onSuccess: () => {
                    // toast.success(tr("place_deleted_success"));

                    setDeleteModal(false);
                    setItem(null);
                },

                onError: () => {
                    // toast.error(tr("place_delete_failed"));
                },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────

    const handleSearch = (value: string) => {
        setSearch(value);

        router.get(
            route("role.category.placelist", {
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

    // ─────────────────────────────────────────────────────────────
    // Select all
    // ─────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────
    // Bulk delete
    // ─────────────────────────────────────────────────────────────

    const deleteMultiple = (deleteRelatedPads: boolean = false) => {
        if (!selectedIds.length) {
            // toast.warning(tr("select_at_least_one_place"));
            return;
        }

        router.post(
            route("role.places.bulk-destroy", {
                rolePrefix,
            }),
            {
                ids: selectedIds,
                delete_related_pads: deleteRelatedPads ? 1 : 0,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    // toast.success(tr("places_deleted_success"));

                    setSelectedIds([]);
                    setIsMultiDeleteButton(false);
                    setDeleteModalMulti(false);
                },

                onError: () => {
                    // toast.error(tr("places_delete_failed"));
                },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────
    // Columns
    // ─────────────────────────────────────────────────────────────

    const columns = useMemo(
        () => [
            // Checkbox
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

            // ID
            {
                header: tr("id"),
                accessorKey: "id",
                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span className="fw-medium text-primary">
                        #{gujaratiNumber(cellProps.getValue(), currentLocale)}
                    </span>
                ),
            },

            // Place
            {
                header: tr("place"),
                accessorKey: "value",
                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const raw = cellProps.row.original.value;

                    const display = tValue(raw, currentLocale);

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

            // Total Pads
            {
                header: tr("total_pads"),
                accessorKey: "pads_count",
                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const count = cellProps.row.original.pads_count ?? 0;

                    return (
                        <span className="badge bg-info-subtle text-info">
                            {gujaratiNumber(count, currentLocale)}
                        </span>
                    );
                },
            },

            // Created At
            {
                header: tr("created_at"),
                accessorKey: "created_at",
                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const value = cellProps.getValue();

                    const formattedDate = new Date(value)
                        .toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })
                        .replace(/\//g, "-");

                    return (
                        <span className="text-muted">
                            {gujaratiNumber(formattedDate, currentLocale)}
                        </span>
                    );
                },
            },

            // Actions
            {
                header: tr("actions"),

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
                                                        "role.places.pads.show",
                                                        {
                                                            rolePrefix,
                                                            place: row.id,
                                                        },
                                                    ),
                                                )
                                            }
                                        >
                                            <i className="ri-eye-fill align-bottom me-2 text-muted"></i>

                                            {tr("view")}
                                        </Dropdown.Item>
                                    </li>

                                    {/* Edit */}
                                    {canEdit && (
                                        <li>
                                            <Dropdown.Item
                                                onClick={() => handleEdit(row)}
                                            >
                                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>

                                                {tr("edit")}
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

                                                {tr("delete")}
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
            tr,
            currentLocale,
            checkedAll,
            selectedIds,
            data,
            canDelete,
            canEdit,
            rolePrefix,
        ],
    );

    // ─────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────

    return (
        <React.Fragment>
            <Head title={tr("places")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={tr("places_list_title")}
                        pageTitle={tr("places")}
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
                                            {tr("places")}
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
                                                                    "role.category.placeform",
                                                                    {
                                                                        rolePrefix,
                                                                    },
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <i className="ri-add-line align-bottom"></i>{" "}
                                                        {tr("create_place")}
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
                                    {/* Search */}
                                    <div className="d-flex justify-content-end mb-3">
                                        <input
                                            type="search"
                                            className="form-control"
                                            style={{
                                                maxWidth: 280,
                                            }}
                                            placeholder={tr(
                                                "search_place_placeholder",
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
                                                SearchPlaceholder={tr(
                                                    "search_place_placeholder",
                                                )}
                                                onSearch={handleSearch}
                                                onRowClick={handleRowClick}
                                            />

                                            {/* Pagination */}
                                            {places.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr("showing")}{" "}
                                                        {gujaratiNumber(
                                                            data.length,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("of")}{" "}
                                                        {gujaratiNumber(
                                                            places.total,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("results")}
                                                    </small>

                                                    <ul className="pagination pagination-sm mb-0">
                                                        {places.links.map(
                                                            (link, idx) => (
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
                                                {tr("no_places_found")}
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

PlaceList.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default PlaceList;
