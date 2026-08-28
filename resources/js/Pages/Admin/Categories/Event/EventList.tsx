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
import { categories } from "../../../../common/data/jobLanding";

// ─────────────────────────────────────────────────────────────────────────────
// Resolve translation object → string
// Example:
// { en: "Diwali", gu: "દિવાળી" } → Diwali / દિવાળી
// ─────────────────────────────────────────────────────────────────────────────
const t = (v, locale = "en") => {
    if (v == null) return "";

    if (typeof v === "string") {
        return v;
    }

    if (typeof v === "object") {
        return v[locale] ?? v.en ?? v.gu ?? Object.values(v)[0] ?? "";
    }

    return String(v);
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────    ────────────────────────────────────
/**
 * @typedef {Object} EventItem
 * @property {number} id
 * @property {string|Object} type
 * @property {string|Object} value
 * @property {number} [pads_count]
 * @property {number} [created_by]
 * @property {string} created_at
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} PaginatedEvents
 * @property {EventItem[]} data
 * @property {number} current_page
 * @property {number} last_page
 * @property {number} per_page
 * @property {number} total
 * @property {Array} links
 */

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const translations = {
    en: {
        create: "Create Event",
        title: "EVENTS LIST",
        pageTitle: "Events",
        searchPlaceholder: "Search by event name…",
        noData: "No events found.",
        deleteSuccess: "Event deleted successfully.",
        bulkDeleteSuccess: "Events deleted successfully.",
        bulkDeleteFail: "Failed to delete events.",
        selectAtLeastOne: "Select at least one event.",
        view: "View",
        edit: "Edit",
        delete: "Delete",
        showing: "Showing",
        of: "of",
        results: "results",
    },

    gu: {
        create: "પ્રસંગ બનાવો",
        title: "પ્રસંગની યાદી",
        pageTitle: "પ્રસંગ",
        searchPlaceholder: "પ્રસંગ શોધો…",
        noData: "કોઈ પ્રસંગ મળી નથી.",
        deleteSuccess: "પ્રસંગ સફળતાપૂર્વક કાઢી નાખવામાં આવી.",
        bulkDeleteSuccess: "પ્રસંગ સફળતાપૂર્વક કાઢી નાખવામાં આવી.",
        bulkDeleteFail: "પ્રસંગ કાઢી નાખવામાં નિષ્ફળતા.",
        selectAtLeastOne: "ઓછામાં ઓછું એક પ્રસંગ પસંદ કરો.",
        view: "જુઓ",
        edit: "ફેરફાર કરો",
        delete: "કાઢી નાખો",
        showing: "બતાવી રહ્યા છીએ",
        of: "માંથી",
        results: "પરિણામો",
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const EventList = ({ events, filters }) => {
    const page = usePage().props;
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const locale = page.locale === "gu" ? "gu" : "en";

    const isGu = locale === "gu";
    const tr = translations[locale];
    const { can } = usePermission();
    const canCreate = can("categories", "create");
    const canEdit = can("categories", "edit");
    const canDelete = can("categories", "delete");

    const [data, setData] = useState(events?.data ?? []);

    // ─────────────────────────────────────────────────────────────────────────
    // Delete state
    // ─────────────────────────────────────────────────────────────────────────
    const [item, setItem] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────
    const [search, setSearch] = useState(filters?.search ?? "");

    const { selectedLetter, handleLetterFilter } = useAlphabetFilter(
        "role.category.eventlist",
        {
            rolePrefix: rolePrefix,
            search: search || undefined,
            per_page: 10,
        },
    );
    // ─────────────────────────────────────────────────────────────────────────
    // Selected IDs
    // ─────────────────────────────────────────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState([]);
    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    // Update local data when Inertia receives new props
    useEffect(() => {
        if (events?.data) {
            setData(events.data);
        }
    }, [events]);

    // ─────────────────────────────────────────────────────────────────────────
    // Column labels
    // ─────────────────────────────────────────────────────────────────────────
    const labels = {
        en: {
            id: "ID",
            value: "Event",
            padsCount: "Total Pads",
            createdAt: "Created At",
            actions: "Actions",
        },

        gu: {
            id: "ક્રમ",
            type: "પ્રકાર",
            value: "પ્રસંગ",
            padsCount: "કુલ પદો",
            createdAt: "બનાવ્યાની તારીખ",
            actions: "ક્રિયાઓ",
        },
    }[locale];

    // ─────────────────────────────────────────────────────────────────────────
    // Edit
    // ─────────────────────────────────────────────────────────────────────────
    const handleEdit = (row: Event) => {
        router.visit(
            route("role.event.edit", {
                rolePrefix: rolePrefix,
                event: row.id,
            }),
        );
    };

    // const handleRowClick = (row: Pad) => {
    //     router.visit(route("admin.events.pads.show", row.id));
    // };
    const handleRowClick = (row: Event) => {
        router.visit(
            route("role.events.pads.show", {
                rolePrefix: rolePrefix,
                event: row.id,
            }),
        );
    };
    // ─────────────────────────────────────────────────────────────────────────
    // Delete single
    // ─────────────────────────────────────────────────────────────────────────
    const onClickDelete = (row) => {
        setItem(row);
        setDeleteModal(true);
    };
    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────
    const handleSearch = (value) => {
        console.log("EVENT SEARCH:", value);

        setSearch(value);

        router.get(
            route("role.category.eventlist", {
                rolePrefix: rolePrefix,
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

    const handleDelete = (deleteRelatedPads: boolean = false) => {
        if (!item) return;

        router.delete(
            route("role.event.destroy", {
                rolePrefix: rolePrefix,
                id: item.id,
            }),
            {
                data: {
                    delete_related_pads: deleteRelatedPads ? 1 : 0,
                },
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModal(false);
                    toast.success(tr.deleteSuccess);
                },
            },
        );
    };

    const deleteMultiple = (deleteRelatedPads = false) => {
        if (!selectedIds.length) {
            toast.warning(tr.selectAtLeastOne);
            return;
        }

        router.post(
            route("role.events.bulk-destroy", { rolePrefix }), // ← fixed name
            {
                ids: selectedIds,
                delete_related_pads: deleteRelatedPads ? 1 : 0,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(tr.bulkDeleteSuccess);
                    setSelectedIds([]);
                    setIsMultiDeleteButton(false);
                    setDeleteModalMulti(false);
                },
                onError: () => toast.error(tr.bulkDeleteFail),
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Columns
    // ─────────────────────────────────────────────────────────────────────────
    const columns = useMemo(
        () => [
            ...(canDelete
                ? [
                      // Checkbox
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

                          cell: (cellProps) => {
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
                header: labels.id,
                accessorKey: "id",
                enableColumnFilter: false,

                cell: (cellProps) => (
                    <span className="fw-medium text-primary">
                        #{gujaratiNumber(cellProps.getValue(), locale)}
                    </span>
                ),
            },

            // Event value
            {
                header: labels.value,
                accessorKey: "value",
                enableColumnFilter: false,

                cell: (cellProps) => {
                    const raw = cellProps.row.original.value;

                    const display = t(raw, locale);

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

            // Pads count
            {
                header: labels.padsCount,
                accessorKey: "pads_count",
                enableColumnFilter: false,

                cell: (cellProps) => {
                    const count = cellProps.row.original.pads_count ?? 0;

                    return (
                        <span className="badge bg-info-subtle text-info">
                            {gujaratiNumber(count, locale)}
                        </span>
                    );
                },
            },

            // Created date
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

            // Actions
            {
                header: labels.actions,

                cell: (cellProps) => {
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
                                            href={route(
                                                "role.events.pads.show",
                                                {
                                                    rolePrefix: rolePrefix,
                                                    event: cellProps.row
                                                        .original.id,
                                                },
                                            )}
                                        >
                                            <i className="ri-eye-fill align-bottom me-2 text-muted"></i>
                                            {tr.view}
                                        </Dropdown.Item>
                                    </li>

                                    {/* Edit */}
                                    {canEdit && (
                                        <li>
                                            <Dropdown.Item
                                                onClick={() => handleEdit(row)}
                                            >
                                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                                                {tr.edit}
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
                                                {tr.delete}
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
        [labels, locale, tr, checkedAll, selectedIds, data, canDelete, canEdit],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <React.Fragment>
            <Head title={tr.title} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={tr.title} pageTitle={tr.pageTitle} />

                    {/* Single Delete Modal */}
                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() => setDeleteModal(false)}
                        showPadsOption={true} // ← enable checkbox
                        isGu={isGu}
                    />
                    {/* Bulk Delete Modal */}
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
                                {/* Header */}
                                <Card.Header className="border-0">
                                    <div className="d-flex align-items-center">
                                        <h5 className="card-title mb-0 flex-grow-1">
                                            {isGu ? "પ્રસંગો" : "Events"}
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
                                    {/*  Search Box */}
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
                                                    tr.searchPlaceholder
                                                }
                                                onSearch={handleSearch}
                                                onRowClick={handleRowClick}
                                            />

                                            {/* Pagination */}
                                            {events.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr.showing}{" "}
                                                        {data.length} {tr.of}{" "}
                                                        {events.total}{" "}
                                                        {tr.results}
                                                    </small>

                                                    <ul className="pagination pagination-sm mb-0">
                                                        {events.links.map(
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

EventList.layout = (page) => <Layout children={page} />;

export default EventList;
