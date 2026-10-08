import React, { useEffect, useMemo, useState, useCallback } from "react";

import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";

import TableContainer from "../../../Components/Common/TableContainer";

import { Head, router, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import DeleteModal from "../../../Components/Common/DeleteModal";

import Layout from "../../../Layouts";

import { gujaratiNumber } from "../../../utils/number";

interface Permission {
    id: number;
    name: string;
    module: string;
    action: string;
    display_name: string;
}

interface Role {
    id: number;
    name: string;
    created_at: string;
    permissions?: Permission[];
    users_count?: number;
}

interface PaginatedRoles {
    data: Role[];
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

interface Props {
    roles: PaginatedRoles;
    filters?: {
        search?: string;
    };
}

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

const createTranslator = (
    translations: Record<string, any>,
): TranslationFunction => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ): string => {
        let text = translations[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(new RegExp(`:${name}`, "g"), String(value));
        });

        return text;
    };
};

const formatDate = (value: any, locale: string): string => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const parts = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).formatToParts(date);

    const day = parts.find((part) => part.type === "day")?.value ?? "";

    const month = parts.find((part) => part.type === "month")?.value ?? "";

    const year = parts.find((part) => part.type === "year")?.value ?? "";

    const formatted = `${day}-${month}-${year}`;

    return gujaratiNumber(formatted, locale);
};

const List: React.FC<Props> = ({ roles }) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale } = page;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const [roleData, setRoleData] = useState<Role[]>(roles?.data ?? []);

    const [item, setItem] = useState<Role | null>(null);

    const [deleteModal, setDeleteModal] = useState(false);

    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    useEffect(() => {
        if (roles?.data) {
            setRoleData(roles.data);
        }
    }, [roles]);

    useEffect(() => {
        setSelectedIds([]);
        setIsMultiDeleteButton(false);
    }, [roles?.data]);

    const handleCreate = () => {
        router.visit(
            route("role.roles.create", {
                rolePrefix,
            }),
        );
    };

    const handleEdit = (row: Role) => {
        router.visit(
            route("role.roles.edit", {
                rolePrefix,
                role: row.id,
            }),
        );
    };

    const onClickDelete = (row: Role) => {
        setItem(row);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (!item) {
            return;
        }

        router.delete(
            route("role.roles.destroy", {
                rolePrefix,
                role: item.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModal(false);
                    setItem(null);

                    // toast.success(tr("role_deleted_success"));
                },
            },
        );
    };

    const checkedAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                const allIds = roleData.map((role) => Number(role.id));

                setSelectedIds(allIds);
                setIsMultiDeleteButton(allIds.length > 0);
            } else {
                setSelectedIds([]);
                setIsMultiDeleteButton(false);
            }
        },
        [roleData],
    );

    const deleteMultiple = () => {
        if (!selectedIds.length) {
            // toast.warning(tr("select_at_least_one_role"));

            return;
        }

        router.post(
            route("role.roles.bulk-destroy", {
                rolePrefix,
            }),
            {
                ids: selectedIds,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // toast.success(tr("roles_deleted_success"));

                    setSelectedIds([]);
                    setIsMultiDeleteButton(false);
                },

                onError: () => {
                    // toast.error(tr("roles_delete_failed"));
                },
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
                            roleData.length > 0 &&
                            selectedIds.length === roleData.length
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
                header: tr("id"),
                accessorKey: "id",
                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const rowIndex =
                        (roles.current_page - 1) * roles.per_page +
                        cellProps.row.index +
                        1;
                    return (
                        <span className="fw-medium text-primary">
                            {gujaratiNumber(rowIndex, locale)}
                        </span>
                    );
                },
            },

            {
                header: tr("role_name"),
                accessorKey: "name",
                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span className="text-body fw-semibold">
                        {cellProps.getValue()}
                    </span>
                ),
            },

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

            {
                header: tr("role_actions"),

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

                                        {tr("role_edit")}
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

                                        {tr("role_delete")}
                                    </Dropdown.Item>
                                </li>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ],
        [currentLocale, tr, checkedAll, selectedIds, roleData],
    );

    return (
        <>
            <Head title={tr("roles")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={tr("roles_list")}
                        pageTitle={tr("roles")}
                    />

                    {/* Single Delete */}
                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() => setDeleteModal(false)}
                    />

                    {/* Multiple Delete */}
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
                                            {tr("roles_list")}
                                        </h5>

                                        <div className="flex-shrink-0">
                                            <div className="d-flex flex-wrap gap-2">
                                                <button
                                                    className="btn btn-danger add-btn"
                                                    onClick={handleCreate}
                                                >
                                                    <i className="ri-add-line align-bottom"></i>{" "}
                                                    {tr("create_role")}
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
                                    {roleData && roleData.length > 0 ? (
                                        <>
                                            <TableContainer
                                                columns={columns}
                                                data={roleData}
                                                isGlobalFilter={true}
                                                customPageSize={10}
                                                divClass="table-responsive table-card mb-3"
                                                tableClass="align-middle table-nowrap mb-0"
                                                SearchPlaceholder={tr(
                                                    "role_search_placeholder",
                                                )}
                                            />

                                            {roles.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr("showing")}{" "}
                                                        {gujaratiNumber(
                                                            roleData.length,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("of")}{" "}
                                                        {gujaratiNumber(
                                                            roles.total,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("results")}
                                                    </small>

                                                    <ul className="pagination pagination-sm mb-0">
                                                        {roles.links.map(
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
                                            {tr("no_roles_found")}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

List.layout = (page: any) => <Layout>{page}</Layout>;

export default List;
