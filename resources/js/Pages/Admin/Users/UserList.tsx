import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";
import TableContainer from "../../../Components/Common/TableContainer";
import { Head, router, usePage } from "@inertiajs/react";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Layout from "../../../Layouts";
import { gujaratiNumber } from "../../../utils/number";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Role {
    id: number;
    name: string;
}

interface UserName {
    [key: string]: string | undefined;
}

interface User {
    id: number;
    name: UserName | string;
    email: string;
    phone: string | null;
    status: number | string;
    role_id: number | null;
    role?: Role | null;
    language_id?: number | null;
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: PaginatedUsers;
    filters?: {
        search?: string;
    };
}

// ── Resolve translation object → string (for DB multilingual values) ──────────
const tValue = (v: any, locale = "en"): string => {
    if (v == null) {
        return "";
    }

    if (typeof v === "string") {
        return v;
    }

    if (typeof v === "object") {
        const currentValue = v[locale];

        if (typeof currentValue === "string" && currentValue.trim() !== "") {
            return currentValue;
        }

        const fallback = Object.values(v).find(
            (value) => typeof value === "string" && value.trim() !== "",
        );

        return typeof fallback === "string" ? fallback : "";
    }

    return String(v);
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, t }: { status: string; t: any }) => {
    const isActive = status === "unblocked";

    return (
        <span
            className={`badge ${
                isActive
                    ? "bg-success-subtle text-success"
                    : "bg-danger-subtle text-danger"
            }`}
        >
            {isActive ? t.status_active : t.status_blocked}
        </span>
    );
};

// ─── Component ────────────────────────────────────────────────────────────────

const UserList: React.FC<Props> = ({ users, filters }) => {
    const page = usePage().props as any;
    const { auth, translations = {}, locale: pageLocale } = page;
    const locale = pageLocale || "gu";
    const t = translations;

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const [data, setData] = useState<User[]>(users?.data ?? []);

    // Delete
    const [item, setItem] = useState<User | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    // Filters
    const [search, setSearch] = useState(filters?.search ?? "");

    useEffect(() => {
        setSearch(filters?.search ?? "");
    }, [filters?.search]);

    useEffect(() => {
        if (users?.data) setData(users.data);
    }, [users]);

    const handleEdit = (row: User) => {
        router.visit(
            route("role.users.edit", {
                rolePrefix,
                user: row.id,
            }),
        );
    };

    const handleCreate = () => {
        router.visit(
            route("role.users.form", {
                rolePrefix,
            }),
        );
    };

    const onClickDelete = (row: User) => {
        setItem(row);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (!item) return;

        router.delete(
            route("role.users.destroy", {
                rolePrefix,
                user: item.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModal(false);
                    // toast.success(t.user_deleted_success);
                },
            },
        );
    };

    const handleSearch = (value: string) => {
        setSearch(value);

        router.get(
            route("role.users.list", {
                rolePrefix,
            }),
            { search: value || undefined },
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

    const deleteMultiple = () => {
        if (!selectedIds.length) {
            // toast.warning(t.select_at_least_one);
            return;
        }
        router.post(
            route("role.users.bulk-destroy", {
                rolePrefix,
            }),
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // toast.success(t.users_deleted_success);
                    setSelectedIds([]);
                    setIsMultiDeleteButton(false);
                    setDeleteModalMulti(false);
                },
                // onError: () => toast.error(t.users_delete_failed),
            },
        );
    };

    const columns = useMemo(
        () => [
            {
                id: "select",
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
            },
            {
                id: "id",
                header: t.id,
                accessorKey: "id",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const rowIndex = (users.current_page - 1) * users.per_page + cellProps.row.index + 1;
                    return (
                        <span className="fw-medium text-primary">
                            {gujaratiNumber(rowIndex, locale)}
                        </span>
                    );
                },
            },
            {
                id: "name",
                header: t.name,
                accessorKey: "name",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const rowUser = cellProps.row.original;
                    const displayName = tValue(rowUser.name, locale);
                    return (
                        <span className="text-body fw-semibold">
                            {displayName}
                            {rowUser.role?.name && (
                                <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle ms-2">
                                    {rowUser.role.name}
                                </span>
                            )}
                        </span>
                    );
                },
            },
            {
                id: "email",
                header: t.email,
                accessorKey: "email",
                enableColumnFilter: false,
                cell: (cellProps: any) => <span>{cellProps.getValue()}</span>,
            },
            {
                id: "phone",
                header: t.phone,
                accessorKey: "phone",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const phone = cellProps.getValue();
                    return (
                        <span>
                            {phone != null && phone !== ""
                                ? gujaratiNumber(phone, locale)
                                : "-"}
                        </span>
                    );
                },
            },
            {
                id: "status",
                header: t.status,
                accessorKey: "status",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <StatusBadge status={cellProps.getValue()} t={t} />
                ),
            },
            {
                id: "created_at",
                header: t.created_at,
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
                id: "actions",
                header: t.actions,
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
                                            handleEdit(cellProps.row.original)
                                        }
                                    >
                                        <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                                        {t.edit}
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
                                        <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                        {t.delete}
                                    </Dropdown.Item>
                                </li>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ],
        [t, locale, checkedAll, selectedIds, data],
    );

    return (
        <React.Fragment>
            <Head title={t.users} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={t.users_list} pageTitle={t.users} />

                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
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
                                            {t.users}
                                        </h5>
                                        <div className="flex-shrink-0">
                                            <div className="d-flex flex-wrap gap-2">
                                                <button
                                                    className="btn btn-danger add-btn"
                                                    onClick={handleCreate}
                                                >
                                                    <i className="ri-add-line align-bottom"></i>{" "}
                                                    {t.create_user}
                                                </button>
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
                                                theadClass=""
                                                thClass=""
                                                SearchPlaceholder={
                                                    t.user_search_placeholder
                                                }
                                                onSearch={handleSearch}
                                            />

                                            {users.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {t.showing}{" "}
                                                        {data.length} {t.of}{" "}
                                                        {users.total}{" "}
                                                        {t.results}
                                                    </small>
                                                    <ul className="pagination pagination-sm mb-0">
                                                        {users.links.map(
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
                                                {t.no_users_found}
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

UserList.layout = (page: any) => <Layout children={page} />;
export default UserList;
