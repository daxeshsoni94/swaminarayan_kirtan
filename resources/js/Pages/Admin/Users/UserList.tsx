import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";
import TableContainer from "../../../Components/Common/TableContainer";
import { Head, router, usePage } from "@inertiajs/react";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../../../Layouts";
import { gujaratiNumber } from "../../../utils/number";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Role {
    id: number;
    name: string;
}

interface UserName {
    en?: string;
    gu?: string;
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

// ── Resolve translation object → string ───────────────────────────────────────
const t = (v: any, locale = "en"): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
        return v[locale] ?? v.en ?? v.gu ?? Object.values(v)[0] ?? "";
    }
    return String(v);
};

// ─── Translations ─────────────────────────────────────────────────────────────

const translations = {
    en: {
        pageTitle: "Users",
        listTitle: "Users List",
        create: "Create User",
        searchPlaceholder: "Search name, mobile number or email…",
        noData: "No users found.",
        showing: "Showing",
        of: "of",
        results: "results",
        view: "View",
        edit: "Edit",
        delete: "Delete",
        deleteSuccess: "User deleted successfully",
        bulkDeleteSuccess: "Users deleted successfully.",
        bulkDeleteFail: "Failed to delete users.",
        selectAtLeastOne: "Select at least one item.",
        active: "Active",
        blocked: "Block",
    },
    gu: {
        pageTitle: "વપરાશકર્તાઓ",
        listTitle: "વપરાશકર્તા યાદી",
        create: "વપરાશકર્તા બનાવો",
        searchPlaceholder: "નામ, મોબાઇલ નંબર અથવા ઈમેઇલ શોધો…",
        noData: "કોઈ વપરાશકર્તા મળ્યા નથી.",
        showing: "બતાવી રહ્યા છીએ",
        of: "માંથી",
        results: "પરિણામો",
        view: "જુઓ",
        edit: "ફેરફાર કરો",
        delete: "કાઢી નાખો",
        deleteSuccess: "વપરાશકર્તા સફળતાપૂર્વક કાઢી નાખ્યો",
        bulkDeleteSuccess: "વપરાશકર્તાઓ સફળતાપૂર્વક કાઢી નાખ્યા.",
        bulkDeleteFail: "વપરાશકર્તાઓ કાઢી નાખવામાં નિષ્ફળતા.",
        selectAtLeastOne: "ઓછામાં ઓછું એક આઇટમ પસંદ કરો.",
        active: "પ્રકાશિત",
        blocked: "બ્લોક",
    },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({
    status,
    tr,
}: {
    status: string;
    tr: (typeof translations)["en"];
}) => {
    const isActive = status === "unblocked";
    return (
        <span
            className={`badge ${
                isActive
                    ? "bg-success-subtle text-success"
                    : "bg-danger-subtle text-danger"
            }`}
        >
            {isActive ? tr.active : tr.blocked}
        </span>
    );
};

// ─── Component ────────────────────────────────────────────────────────────────

const UserList: React.FC<Props> = ({ users, filters }) => {
    const page = usePage().props as { locale?: string };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const isGu = locale === "gu";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const tr = translations[locale];

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

    const labels = {
        en: {
            id: "ID",
            name: "Name",
            email: "Email",
            phone: "Phone",
            status: "Status",
            createdAt: "Created At",
            actions: "Actions",
        },
        gu: {
            id: "ક્રમ",
            name: "નામ",
            email: "ઈમેઈલ",
            phone: "ફોન",
            status: "સ્થિતિ",
            createdAt: "બનાવ્યાની તારીખ",
            actions: "ક્રિયાઓ",
        },
    }[locale];

    const handleEdit = (row: User) => {
        router.visit(
            route("role.users.edit", {
                rolePrefix: rolePrefix,
                user: row.id,
            }),
        );
    };
    const handleCreate = () => {
        router.visit(
            route("role.users.form", {
                rolePrefix: rolePrefix,
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
                rolePrefix: rolePrefix,
                user: item.id,
            }),
            {
                onSuccess: () => {
                    setDeleteModal(false);
                    toast.success(tr.deleteSuccess);
                },
            },
        );
    };

    const handleSearch = (value: string) => {
        setSearch(value);

        router.get(
            route("role.users.list", {
                rolePrefix: rolePrefix,
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
            toast.warning(tr.selectAtLeastOne);
            return;
        }
        router.post(
            route("role.users.bulk-destroy", {
                rolePrefix: rolePrefix,
            }),
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(tr.bulkDeleteSuccess);
                    setSelectedIds([]);
                    setIsMultiDeleteButton(false);
                },
                onError: () => toast.error(tr.bulkDeleteFail),
            },
        );
    };

    const columns = useMemo(
        () => [
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
                header: labels.name,
                accessorKey: "name",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const rowUser = cellProps.row.original;
                    const displayName = t(rowUser.name, locale);
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
                header: labels.email,
                accessorKey: "email",
                enableColumnFilter: false,
                cell: (cellProps: any) => <span>{cellProps.getValue()}</span>,
            },
            {
                header: labels.phone,
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
                header: labels.status,
                accessorKey: "status",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <StatusBadge status={cellProps.getValue()} tr={tr} />
                ),
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
                                        onClick={() =>
                                            handleEdit(cellProps.row.original)
                                        }
                                    >
                                        <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                                        {tr.edit}
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
                                        {tr.delete}
                                    </Dropdown.Item>
                                </li>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ],
        [labels, locale, tr, checkedAll, selectedIds, data],
    );

    return (
        <React.Fragment>
            <Head title={tr.pageTitle} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={tr.listTitle} pageTitle={tr.pageTitle} />

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
                                            {tr.pageTitle}
                                        </h5>
                                        <div className="flex-shrink-0">
                                            <div className="d-flex flex-wrap gap-2">
                                                <button
                                                    className="btn btn-danger add-btn"
                                                    onClick={handleCreate}
                                                >
                                                    <i className="ri-add-line align-bottom"></i>{" "}
                                                    {tr.create}
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
                                                    tr.searchPlaceholder
                                                }
                                                onSearch={handleSearch}
                                            />

                                            {users.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr.showing}{" "}
                                                        {data.length} {tr.of}{" "}
                                                        {users.total}{" "}
                                                        {tr.results}
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
                                                {tr.noData}
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

UserList.layout = (page: any) => <Layout children={page} />;
export default UserList;
