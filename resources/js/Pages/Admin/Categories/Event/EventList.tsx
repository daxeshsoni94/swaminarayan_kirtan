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
 *     en: "Diwali",
 *     gu: "દિવાળી"
 * }
 *
 * Returns the value for the current locale.
 */
const tValue = (value, locale) => {
    if (value == null) return "";

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        return (
            value[locale] ??
            Object.values(value)[0] ??
            ""
        );
    }

    return String(value);
};

/**
 * Centralized translation helper.
 */
const createTranslator = (translations) => {
    return (
        key,
        replacements = {}
    ) => {
        let text = translations?.[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });

        return text;
    };
};

const EventList = ({ events, filters }) => {
    const page = usePage().props;

    const {
        auth,
        translations = {},
        locale,
    } = page;

    const currentLocale = locale || "gu";

    const tr = useMemo(
        () => createTranslator(translations),
        [translations]
    );

    /**
     * Dynamic role prefix.
     */
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name
              .toLowerCase()
              .replace(/\s+/g, "-")
        : "admin";

    /**
     * Permissions.
     */
    const { can } = usePermission();

    const canCreate = can("categories", "create");
    const canEdit = can("categories", "edit");
    const canDelete = can("categories", "delete");

    /**
     * Local table data.
     */
    const [data, setData] = useState(events?.data ?? []);

    /**
     * Delete state.
     */
    const [item, setItem] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] =
        useState(false);

    /**
     * Search.
     */
    const [search, setSearch] = useState(
        filters?.search ?? ""
    );

    const {
        selectedLetter,
        handleLetterFilter,
    } = useAlphabetFilter(
        "role.category.eventlist",
        {
            rolePrefix,
            search: search || undefined,
            per_page: 10,
        }
    );

    /**
     * Selected IDs.
     */
    const [selectedIds, setSelectedIds] = useState([]);
    const [isMultiDeleteButton, setIsMultiDeleteButton] =
        useState(false);

    /**
     * Update local data when Inertia receives new props.
     */
    useEffect(() => {
        if (events?.data) {
            setData(events.data);
        }
    }, [events]);

    /**
     * Column labels.
     *
     * All labels now come from centralized translations.
     */
    const labels = {
        id: tr("id"),
        value: tr("event"),
        padsCount: tr("total_pads"),
        createdAt: tr("created_at"),
        actions: tr("actions"),
    };

    /**
     * Edit event.
     */
    const handleEdit = (row) => {
        router.visit(
            route("role.event.edit", {
                rolePrefix,
                event: row.id,
            })
        );
    };

    /**
     * Open event pads.
     */
    const handleRowClick = (row) => {
        router.visit(
            route("role.events.pads.show", {
                rolePrefix,
                event: row.id,
            })
        );
    };

    /**
     * Open single delete modal.
     */
    const onClickDelete = (row) => {
        setItem(row);
        setDeleteModal(true);
    };

    /**
     * Search.
     */
    const handleSearch = (value) => {
        setSearch(value);

        router.get(
            route("role.category.eventlist", {
                rolePrefix,
            }),
            {
                search: value || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    /**
     * Select / unselect all.
     */
    const checkedAll = useCallback(
        (checked) => {
            if (checked) {
                const allIds = data.map((row) =>
                    Number(row.id)
                );

                setSelectedIds(allIds);
                setIsMultiDeleteButton(
                    allIds.length > 0
                );
            } else {
                setSelectedIds([]);
                setIsMultiDeleteButton(false);
            }
        },
        [data]
    );

    /**
     * Delete single event.
     */
    const handleDelete = (
        deleteRelatedPads = false
    ) => {
        if (!item) return;

        router.delete(
            route("role.event.destroy", {
                rolePrefix,
                id: item.id,
            }),
            {
                data: {
                    delete_related_pads:
                        deleteRelatedPads ? 1 : 0,
                },

                preserveScroll: true,

                onSuccess: () => {
                    setDeleteModal(false);
                    setItem(null);

                    // toast.success(
                    //     tr("event_deleted_success")
                    // );
                },

                onError: () => {
                    // toast.error(
                    //     tr("event_delete_failed")
                    // );
                },
            }
        );
    };

    /**
     * Delete multiple events.
     */
    const deleteMultiple = (
        deleteRelatedPads = false
    ) => {
        if (!selectedIds.length) {
            toast.warning(
                tr("select_at_least_one_event")
            );
            return;
        }

        router.post(
            route("role.events.bulk-destroy", {
                rolePrefix,
            }),
            {
                ids: selectedIds,

                delete_related_pads:
                    deleteRelatedPads ? 1 : 0,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    // toast.success(
                    //     tr("events_deleted_success")
                    // );

                    setSelectedIds([]);
                    setIsMultiDeleteButton(false);
                    setDeleteModalMulti(false);
                },

                onError: () => {
                    // toast.error(
                    //     tr("events_delete_failed")
                    // );
                },
            }
        );
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
                                      selectedIds.length ===
                                          data.length
                                  }
                                  onChange={(e) =>
                                      checkedAll(
                                          e.target.checked
                                      )
                                  }
                              />
                          ),

                          cell: (cellProps) => {
                              const id = Number(
                                  cellProps.row.original.id
                              );

                              return (
                                  <input
                                      type="checkbox"
                                      className="form-check-input"
                                      value={id}
                                      checked={selectedIds.includes(
                                          id
                                      )}
                                      onClick={(e) =>
                                          e.stopPropagation()
                                      }
                                      onChange={(e) => {
                                          setSelectedIds(
                                              (prev) => {
                                                  const updated =
                                                      e.target
                                                          .checked
                                                          ? [
                                                                ...prev,
                                                                id,
                                                            ]
                                                          : prev.filter(
                                                                (
                                                                    x
                                                                ) =>
                                                                    x !==
                                                                    id
                                                            );

                                                  setIsMultiDeleteButton(
                                                      updated.length >
                                                          0
                                                  );

                                                  return updated;
                                              }
                                          );
                                      }}
                                  />
                              );
                          },

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
                        #
                        {gujaratiNumber(
                            cellProps.getValue(),
                            currentLocale
                        )}
                    </span>
                ),
            },

            /**
             * Event value.
             */
            {
                header: labels.value,
                accessorKey: "value",
                enableColumnFilter: false,

                cell: (cellProps) => {
                    const raw =
                        cellProps.row.original.value;

                    const display = tValue(
                        raw,
                        currentLocale
                    );

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
             * Pads count.
             */
            {
                header: labels.padsCount,
                accessorKey: "pads_count",
                enableColumnFilter: false,

                cell: (cellProps) => {
                    const count =
                        cellProps.row.original
                            .pads_count ?? 0;

                    return (
                        <span className="badge bg-info-subtle text-info">
                            {gujaratiNumber(
                                count,
                                currentLocale
                            )}
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

                cell: (cellProps) => {
                    const value =
                        cellProps.getValue();

                    if (!value) {
                        return (
                            <span className="text-muted">
                                —
                            </span>
                        );
                    }

                    const formattedDate =
                        new Date(
                            value
                        )
                            .toLocaleDateString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                }
                            )
                            .replace(/\//g, "-");

                    return (
                        <span className="text-muted">
                            {gujaratiNumber(
                                formattedDate,
                                currentLocale
                            )}
                        </span>
                    );
                },
            },

            /**
             * Actions.
             */
            {
                header: labels.actions,

                cell: (cellProps) => {
                    const row =
                        cellProps.row.original;

                    return (
                        <div
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
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
                                                        "role.events.pads.show",
                                                        {
                                                            rolePrefix,
                                                            event: row.id,
                                                        }
                                                    )
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
                                                    handleEdit(
                                                        row
                                                    )
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
                                                    onClickDelete(
                                                        row
                                                    )
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
            tr,
            checkedAll,
            selectedIds,
            data,
            canDelete,
            canEdit,
            rolePrefix,
        ]
    );

    return (
        <React.Fragment>
            <Head title={tr("events_list_title")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={tr("events_list_title")}
                        pageTitle={tr("events")}
                    />

                    {/* Single Delete Modal */}
                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() =>
                            setDeleteModal(false)
                        }
                        showPadsOption={true}
                    />

                    {/* Bulk Delete Modal */}
                    <DeleteModal
                        show={deleteModalMulti}
                        onDeleteClick={(
                            deleteRelatedPads
                        ) => {
                            deleteMultiple(
                                deleteRelatedPads
                            );
                        }}
                        onCloseClick={() =>
                            setDeleteModalMulti(false)
                        }
                        showPadsOption={true}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                {/* Header */}
                                <Card.Header className="border-0">
                                    <div className="d-flex align-items-center">
                                        <h5 className="card-title mb-0 flex-grow-1">
                                            {tr("events")}
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
                                                                    "role.category.eventform",
                                                                    {
                                                                        rolePrefix,
                                                                    }
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <i className="ri-add-line align-bottom"></i>{" "}
                                                        {tr(
                                                            "create_event"
                                                        )}
                                                    </button>
                                                )}

                                                {/* Bulk Delete */}
                                                {canDelete &&
                                                    isMultiDeleteButton && (
                                                        <button
                                                            className="btn btn-soft-danger"
                                                            onClick={() =>
                                                                setDeleteModalMulti(
                                                                    true
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
                                                "search_event_placeholder"
                                            )}
                                            value={search}
                                            onChange={(e) =>
                                                handleSearch(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Alphabet Filter */}
                                    <AlphabetFilter
                                        selectedLetter={
                                            selectedLetter
                                        }
                                        onSelect={
                                            handleLetterFilter
                                        }
                                    />

                                    {/* Table */}
                                    {data &&
                                    data.length > 0 ? (
                                        <>
                                            <TableContainer
                                                columns={columns}
                                                data={data}
                                                isGlobalFilter={
                                                    false
                                                }
                                                customPageSize={
                                                    10
                                                }
                                                divClass="table-responsive table-card mb-3"
                                                tableClass="align-middle table-nowrap mb-0"
                                                theadClass=""
                                                thClass=""
                                                SearchPlaceholder={tr(
                                                    "search_event_placeholder"
                                                )}
                                                onSearch={
                                                    handleSearch
                                                }
                                                onRowClick={
                                                    handleRowClick
                                                }
                                            />

                                            {/* Pagination */}
                                            {events.last_page >
                                                1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr(
                                                            "showing"
                                                        )}{" "}
                                                        {gujaratiNumber(
                                                            data.length,
                                                            currentLocale
                                                        )}{" "}
                                                        {tr(
                                                            "of"
                                                        )}{" "}
                                                        {gujaratiNumber(
                                                            events.total,
                                                            currentLocale
                                                        )}{" "}
                                                        {tr(
                                                            "results"
                                                        )}
                                                    </small>

                                                    <ul className="pagination pagination-sm mb-0">
                                                        {events.links.map(
                                                            (
                                                                link,
                                                                idx
                                                            ) => (
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
                                                                                }
                                                                            )
                                                                        }
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: link.label,
                                                                        }}
                                                                    />
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div className="text-muted">
                                                {tr(
                                                    "no_events_found"
                                                )}
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

EventList.layout = (page) => (
    <Layout children={page} />
);

export default EventList;