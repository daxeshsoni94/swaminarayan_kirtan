import React, { useEffect, useMemo, useState, useCallback } from "react";

import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";

import TableContainer from "../../../Components/Common/TableContainer";

import { Head, router, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import DeleteModal from "../../../Components/Common/DeleteModal";

import Layout from "../../../Layouts";

import { gujaratiNumber } from "../../../utils/number";

// ─── Resolve multilingual DB value ───────────────────────────────────────────

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

// ─── Translation helper ──────────────────────────────────────────────────────

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

// ─── User Reference ──────────────────────────────────────────────────────────

interface UserRef {
    id: number;

    name?: string | Record<string, string>;
}

// ─── Contact Item ────────────────────────────────────────────────────────────

interface ContactItem {
    id: number;

    user_id: number | null;

    name: string | Record<string, string>;

    email: string;

    phone: string | null;

    reason_for_contact: string;

    status: "new" | "read" | "resolved";

    user?: UserRef | null;

    created_at?: string;

    updated_at?: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

interface PaginatedContacts {
    data: ContactItem[];

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

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
    contacts: PaginatedContacts;

    filters?: {
        search?: string;

        status?: string | null;
    };
}

// ─── Status Badge ────────────────────────────────────────────────────────────

const StatusBadge = ({
    status,
    tr,
}: {
    status: string;

    tr: (key: string, replacements?: Record<string, string | number>) => string;
}) => {
    const key = (status || "").toLowerCase();

    const map: Record<
        string,
        {
            className: string;
            translationKey: string;
        }
    > = {
        new: {
            className: "bg-danger-subtle text-danger",
            translationKey: "status_new",
        },

        read: {
            className: "bg-info-subtle text-info",
            translationKey: "status_read",
        },

        resolved: {
            className: "bg-success-subtle text-success",
            translationKey: "status_resolved",
        },
    };

    const item = map[key] ?? map.new;

    return (
        <span className={`badge ${item.className}`}>
            {tr(item.translationKey)}
        </span>
    );
};

// ─── Date formatter ──────────────────────────────────────────────────────────

const formatDate = (value: any, locale: string): string => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

// ─── Contacts List ───────────────────────────────────────────────────────────

const List: React.FC<Props> = ({ contacts, filters }) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale } = page;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    // ─── Dynamic role prefix ─────────────────────────────────────────────

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    // ─── List title ──────────────────────────────────────────────────────

    const listTitle =
        filters?.status === "new"
            ? tr("contacts_new")
            : filters?.status === "read"
              ? tr("contacts_read")
              : filters?.status === "resolved"
                ? tr("contacts_resolved")
                : tr("contacts_all");

    // ─── State ───────────────────────────────────────────────────────────

    const [data, setData] = useState<ContactItem[]>(contacts?.data ?? []);

    const [item, setItem] = useState<ContactItem | null>(null);

    const [deleteModal, setDeleteModal] = useState(false);

    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    // ─── Update table data ───────────────────────────────────────────────

    useEffect(() => {
        if (contacts?.data) {
            setData(contacts.data);
        }
    }, [contacts]);

    // ─── Clear selections when page changes ──────────────────────────────

    useEffect(() => {
        setSelectedIds([]);

        setIsMultiDeleteButton(false);
    }, [contacts?.data]);

    // ─── View Contact ────────────────────────────────────────────────────

    const handleView = (row: ContactItem) => {
        router.visit(
            route("role.contacts.show", {
                rolePrefix,
                contact: row.id,
            }),
        );
    };

    // ─── Open Delete Modal ───────────────────────────────────────────────

    const onClickDelete = (row: ContactItem) => {
        setItem(row);

        setDeleteModal(true);
    };

    // ─── Delete Single Contact ───────────────────────────────────────────

    const handleDelete = () => {
        if (!item) {
            return;
        }

        router.delete(
            route("role.contacts.destroy", {
                rolePrefix,
                contact: item.id,
            }),
            {
                preserveScroll: true,

                onSuccess: () => {
                    setDeleteModal(false);

                    setItem(null);

                    // toast.success(tr("contact_deleted_success"));
                },

                onError: () => {
                    // toast.error(tr("contact_delete_failed"));
                },
            },
        );
    };

    // ─── Select All ──────────────────────────────────────────────────────

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

    // ─── Delete Multiple Contacts ────────────────────────────────────────

    const deleteMultiple = () => {
        if (!selectedIds.length) {
            // toast.warning(tr("select_at_least_one_contact"));

            return;
        }

        router.post(
            route("role.contacts.bulk-destroy", {
                rolePrefix,
            }),
            {
                ids: selectedIds,

                _method: "DELETE",
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    // toast.success(tr("contacts_deleted_success"));

                    setSelectedIds([]);

                    setIsMultiDeleteButton(false);
                },

                onError: () => {
                    // toast.error(tr("contacts_delete_failed"));
                },
            },
        );
    };

    // ─── Table Columns ───────────────────────────────────────────────────

    const columns = useMemo(
        () => [
            // ─── Checkbox ────────────────────────────────────────────────

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
                            const id = Number(cellProps.row.original.id);

                            setSelectedIds((prev) => {
                                const updated = e.target.checked
                                    ? [...prev, id]
                                    : prev.filter((x) => x !== id);

                                setIsMultiDeleteButton(updated.length > 0);

                                return updated;
                            });
                        }}
                    />
                ),

                id: "#",
            },

            // ─── ID ──────────────────────────────────────────────────────

            {
                header: tr("id"),

                accessorKey: "id",

                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const rowIndex =
                        (contacts.current_page - 1) * contacts.per_page +
                        cellProps.row.index +
                        1;
                    return (
                        <span className="fw-medium text-primary">
                            {gujaratiNumber(rowIndex, locale)}
                        </span>
                    );
                },
            },

            // ─── Name ────────────────────────────────────────────────────

            {
                header: tr("name"),

                accessorKey: "name",

                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const name = tValue(cellProps.getValue(), currentLocale);

                    return (
                        <span className="text-body fw-semibold">
                            {name || "—"}
                        </span>
                    );
                },
            },

            // ─── Email ───────────────────────────────────────────────────

            {
                header: tr("email"),

                accessorKey: "email",

                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span>{cellProps.getValue() || "—"}</span>
                ),
            },

            // ─── Phone ───────────────────────────────────────────────────

            {
                header: tr("phone"),

                accessorKey: "phone",

                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span>
                        {cellProps.getValue()
                            ? gujaratiNumber(
                                  cellProps.getValue(),
                                  currentLocale,
                              )
                            : "—"}
                    </span>
                ),
            },

            // ─── Reason ──────────────────────────────────────────────────

            {
                header: tr("reason"),

                accessorKey: "reason_for_contact",

                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const text = cellProps.getValue() || "";

                    const short =
                        text.length > 40 ? `${text.slice(0, 40)}…` : text;

                    return <span className="text-muted">{short || "—"}</span>;
                },
            },

            // ─── Status ──────────────────────────────────────────────────

            {
                header: tr("status"),

                accessorKey: "status",

                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <StatusBadge status={cellProps.getValue()} tr={tr} />
                ),
            },

            // ─── Created At ──────────────────────────────────────────────

            {
                header: tr("created_at"),

                accessorKey: "created_at",

                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span className="text-muted">
                        {formatDate(cellProps.getValue(), currentLocale)}
                    </span>
                ),
            },

            // ─── Actions ─────────────────────────────────────────────────

            {
                header: tr("actions"),

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
                                        onClick={() =>
                                            handleView(cellProps.row.original)
                                        }
                                    >
                                        <i className="ri-eye-fill align-bottom me-2 text-muted"></i>

                                        {tr("view")}
                                    </Dropdown.Item>
                                </li>

                                <li>
                                    <Dropdown.Item
                                        className="remove-item-btn"
                                        onClick={() =>
                                            onClickDelete(
                                                cellProps.row.original,
                                            )
                                        }
                                    >
                                        <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>

                                        {tr("delete")}
                                    </Dropdown.Item>
                                </li>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ],
        [currentLocale, tr, checkedAll, selectedIds, data],
    );

    return (
        <React.Fragment>
            <Head title={tr("contacts")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={listTitle} pageTitle={tr("contacts")} />

                    {/* ─── Single Delete ─────────────────────────────── */}

                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() => setDeleteModal(false)}
                    />

                    {/* ─── Multiple Delete ──────────────────────────── */}

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
                                            {listTitle}
                                        </h5>

                                        <div className="flex-shrink-0">
                                            {isMultiDeleteButton && (
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
                                </Card.Header>

                                <Card.Body className="pt-0">
                                    {data && data.length > 0 ? (
                                        <>
                                            <TableContainer
                                                columns={columns}
                                                data={data}
                                                isGlobalFilter={true}
                                                customPageSize={10}
                                                divClass="table-responsive table-card mb-3"
                                                tableClass="align-middle table-nowrap mb-0"
                                                SearchPlaceholder={tr(
                                                    "contact_search_placeholder",
                                                )}
                                            />

                                            {contacts.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr("showing")}{" "}
                                                        {data.length} {tr("of")}{" "}
                                                        {contacts.total}{" "}
                                                        {tr("results")}
                                                    </small>

                                                    <ul className="pagination pagination-sm mb-0">
                                                        {contacts.links.map(
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
                                        <div className="text-center py-5 text-muted">
                                            {tr("no_contacts_found")}
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

List.layout = (page: any) => <Layout children={page} />;

export default List;
