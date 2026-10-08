// resources/js/Pages/Admin/Creators/List.jsx

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
 *   en: "Bramhanand Swami",
 *   gu: "બ્રહ્માનંદ સ્વામી"
 * }
 */
const tValue = (value, locale) => {
    if (value == null) return "";

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        return value?.[locale] ?? Object.values(value)[0] ?? "";
    }

    return String(value);
};

/**
 * Central translation helper.
 *
 * Example:
 * t("creators")
 * t("creator_deleted_success")
 */
const createTranslator = (translations) => {
    return (key, replacements = {}) => {
        let text = translations?.[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });

        return text;
    };
};

const CreatorList = ({ creators, filters }) => {
    const page = usePage().props;

    const { auth, translations = {}, languages = [], locale } = page;

    /**
     * Current role prefix.
     */
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    /**
     * Current locale comes from Laravel/Inertia.
     *
     * No hardcoded en/gu switching here.
     */
    const currentLocale = locale || "gu";

    /**
     * Centralized translator.
     */
    const tr = useMemo(() => createTranslator(translations), [translations]);

    /**
     * Permissions.
     */
    const { can } = usePermission();

    const canCreate = can("categories", "create");

    const canEdit = can("categories", "edit");

    const canDelete = can("categories", "delete");

    /**
     * Creator data.
     */
    const [data, setData] = useState(creators?.data ?? []);

    /**
     * Delete state.
     */
    const [item, setItem] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);

    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    /**
     * Search.
     */
    const [search, setSearch] = useState(filters?.search ?? "");

    /**
     * Alphabet filter.
     */
    const { selectedLetter, handleLetterFilter } = useAlphabetFilter(
        "role.category.creatorlist",
        {
            rolePrefix,
            search: search || undefined,
            per_page: 10,
        },
    );

    /**
     * Update search when backend filters change.
     */
    useEffect(() => {
        setSearch(filters?.search ?? "");
    }, [filters?.search]);

    /**
     * Update table data when pagination/search
     * response comes from Laravel.
     */
    useEffect(() => {
        if (creators?.data) {
            setData(creators.data);
        }
    }, [creators]);

    /**
     * Column labels.
     *
     * All text comes from centralized translations.
     */
    const labels = useMemo(
        () => ({
            id: tr("id"),
            type: tr("type"),
            value: tr("creators"),
            padsCount: tr("total_pads"),
            createdAt: tr("created_at"),
            actions: tr("actions"),
        }),
        [tr],
    );

    /**
     * Edit creator.
     */
    const handleEdit = (row) => {
        router.visit(
            route("role.creators.edit", {
                rolePrefix,
                category: row.id,
            }),
        );
    };

    /**
     * Open creator pads.
     */
    const handleRowClick = (row) => {
        router.visit(
            route("role.creators.pads.show", {
                rolePrefix,
                category: row.id,
            }),
        );
    };

    /**
     * Open delete modal.
     */
    const onClickDelete = (row) => {
        setItem(row);
        setDeleteModal(true);
    };

    /**
     * Search creators.
     */
    const handleSearch = (value) => {
        setSearch(value);

        router.get(
            route("role.category.creatorlist", {
                rolePrefix,
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

    /**
     * Multi-select.
     */
    const [selectedIds, setSelectedIds] = useState([]);

    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    /**
     * Select/unselect all rows.
     */
    const checkedAll = useCallback(
        (checked) => {
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

    /**
     * Delete single creator.
     */
    const handleDelete = (deleteRelatedPads = false) => {
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
                    setItem(null);

                    // toast.success(tr("creator_deleted_success"));
                },
            },
        );
    };

    /**
     * Delete multiple creators.
     */
    const deleteMultiple = (deleteRelatedPads = false) => {
        if (!selectedIds.length) {
            toast.warning(tr("select_at_least_one_creator"));

            return;
        }

        router.post(
            route("role.creators.bulk-destroy", {
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

                    // toast.success(tr("creators_deleted_success"));
                },

                onError: () => {
                    // toast.error(tr("creators_delete_failed"));
                },
            },
        );
    };

    /**
     * Format date according to current locale.
     */
    const formatDate = (date) => {
        if (!date) return "—";

        const formattedDate = new Date(date)
            .toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "-");

        return gujaratiNumber(formattedDate, currentLocale);
    };

    /**
     * Table columns.
     */
    const columns = useMemo(
        () => [
            /**
             * Checkbox column.
             */
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

                          cell: (cellProps) => (
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

            /**
             * ID.
             */
            {
                header: labels.id,

                accessorKey: "id",

                enableColumnFilter: false,

                cell: (cellProps) => (
                    <span className="fw-medium text-primary">
                        #{gujaratiNumber(cellProps.getValue(), currentLocale)}
                    </span>
                ),
            },

            /**
             * Creator name.
             */
            {
                header: labels.value,

                accessorKey: "value",

                enableColumnFilter: false,

                cell: (cellProps) => {
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

            /**
             * Total pads.
             */
            {
                header: labels.padsCount,

                accessorKey: "pads_count",

                enableColumnFilter: false,

                cell: (cellProps) => {
                    const count = cellProps.row.original.pads_count ?? 0;

                    return (
                        <span className="badge bg-info-subtle text-info">
                            {gujaratiNumber(count, currentLocale)}
                        </span>
                    );
                },
            },

            /**
             * Created date.
             */
            {
                header: labels.createdAt,

                accessorKey: "created_at",

                enableColumnFilter: false,

                cell: (cellProps) => (
                    <span className="text-muted">
                        {formatDate(cellProps.getValue())}
                    </span>
                ),
            },

            /**
             * Actions.
             */
            {
                header: labels.actions,

                cell: (cellProps) => {
                    const creator = cellProps.row.original;

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
                                                        "role.creators.pads.show",
                                                        {
                                                            rolePrefix,
                                                            category:
                                                                creator.id,
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
                                                onClick={() =>
                                                    handleEdit(creator)
                                                }
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
                                                    onClickDelete(creator)
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
            labels,
            currentLocale,
            checkedAll,
            selectedIds,
            data,
            canDelete,
            canEdit,
            rolePrefix,
            tr,
        ],
    );

    return (
        <React.Fragment>
            <Head title={tr("creators")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={tr("creators")}
                        pageTitle={tr("creators")}
                    />

                    {/* Single delete modal */}
                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() => setDeleteModal(false)}
                        showPadsOption={true}
                    />

                    {/* Bulk delete modal */}
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
                                <Card.Header className="border-0">
                                    <div className="d-flex align-items-center">
                                        <h5 className="card-title mb-0 flex-grow-1">
                                            {tr("creators")}
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
                                                                    "role.creators.creatorform",
                                                                    {
                                                                        rolePrefix,
                                                                    },
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <i className="ri-add-line align-bottom"></i>{" "}
                                                        {tr("create_creator")}
                                                    </button>
                                                )}

                                                {/* Bulk delete */}
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
                                                "search_creator_placeholder",
                                            )}
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
                                                SearchPlaceholder={tr(
                                                    "search_creator_placeholder",
                                                )}
                                                onSearch={handleSearch}
                                                onRowClick={handleRowClick}
                                            />

                                            {/* Pagination */}
                                            {creators.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr("showing")}{" "}
                                                        {gujaratiNumber(
                                                            data.length,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("of")}{" "}
                                                        {gujaratiNumber(
                                                            creators.total,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("results")}
                                                    </small>

                                                    <ul className="pagination pagination-sm mb-0">
                                                        {creators.links.map(
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
                                                {tr("no_creators_found")}
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

CreatorList.layout = (page) => <Layout children={page} />;

export default CreatorList;
