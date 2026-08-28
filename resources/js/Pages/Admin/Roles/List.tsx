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
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    roles: PaginatedRoles;
    filters?: { search?: string };
}

const translations = {
    en: {
        pageTitle: "Roles",
        listTitle: "Roles List",
        create: "Create Role",
        searchPlaceholder: "Search for role name…",
        noData: "No roles found.",
        showing: "Showing",
        of: "of",
        results: "results",
        id: "ID",
        name: "Name",
        createdAt: "Created At",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        deleteSuccess: "Role deleted successfully",
        bulkDeleteSuccess: "Roles deleted successfully.",
        bulkDeleteFail: "Failed to delete roles.",
        selectAtLeastOne: "Select at least one item.",
    },
    gu: {
        pageTitle: "ભૂમિકાઓ",
        listTitle: "ભૂમિકા યાદી",
        create: "ભૂમિકા બનાવો",
        searchPlaceholder: "ભૂમિકાનું નામ શોધો…",
        noData: "કોઈ ભૂમિકા મળી નથી.",
        showing: "બતાવી રહ્યા છીએ",
        of: "માંથી",
        results: "પરિણામો",
        id: "ક્રમ",
        name: "નામ",
        createdAt: "બનાવ્યાની તારીખ",
        actions: "ક્રિયાઓ",
        edit: "ફેરફાર કરો",
        delete: "કાઢી નાખો",
        deleteSuccess: "ભૂમિકા સફળતાપૂર્વક કાઢી નાખી",
        bulkDeleteSuccess: "ભૂમિકાઓ સફળતાપૂર્વક કાઢી નાખી.",
        bulkDeleteFail: "ભૂમિકાઓ કાઢી નાખવામાં નિષ્ફળતા.",
        selectAtLeastOne: "ઓછામાં ઓછું એક આઇટમ પસંદ કરો.",
    },
};

const List: React.FC<Props> = ({ roles, filters }) => {
    const page = usePage().props as { locale?: string };
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const tr = translations[locale];

    const [roleData, setRoleData] = useState<Role[]>(roles?.data ?? []);
    const [item, setItem] = useState<Role | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    // Multi-select
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    useEffect(() => {
        if (roles?.data) setRoleData(roles.data);
    }, [roles]);

    // Clear selection when page data changes
    useEffect(() => {
        setSelectedIds([]);
        setIsMultiDeleteButton(false);
    }, [roles?.data]);

    const handleCreate = () => {
        router.visit(
            route("role.roles.create", {
                rolePrefix: rolePrefix,
            }),
        );
    };

    const handleEdit = (row: Role) => {
        router.visit(
            route("role.roles.edit", {
                rolePrefix: rolePrefix,
                role: row.id,
            }),
        );
    };

    const onClickDelete = (row: Role) => {
        setItem(row);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (!item) return;

        router.delete(
            route("role.roles.destroy", {
                rolePrefix: rolePrefix,
                role: item.id,
            }),
            {
                onSuccess: () => {
                    setDeleteModal(false);
                    toast.success(tr.deleteSuccess);
                },
            },
        );
    };

    const checkedAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                const allIds = roleData.map((r) => Number(r.id));
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
            toast.warning(tr.selectAtLeastOne);
            return;
        }

        router.post(
            route("role.roles.bulk-destroy", {
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
                header: tr.id,
                accessorKey: "id",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <span className="fw-medium text-primary">
                        #{gujaratiNumber(cellProps.getValue(), locale)}
                    </span>
                ),
            },
            {
                header: tr.name,
                accessorKey: "name",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <span className="text-body fw-semibold">
                        {cellProps.getValue()}
                    </span>
                ),
            },
            {
                header: tr.createdAt,
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
                header: tr.actions,
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
        [locale, tr, checkedAll, selectedIds, roleData],
    );

    return (
        <React.Fragment>
            <Head title={tr.pageTitle} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={tr.listTitle} pageTitle={tr.pageTitle} />

                    {/* Single delete */}
                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() => setDeleteModal(false)}
                    />

                    {/* Multi delete */}
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
                                            {tr.listTitle}
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
                                    {roleData && roleData.length > 0 ? (
                                        <>
                                            <TableContainer
                                                columns={columns}
                                                data={roleData}
                                                isGlobalFilter={true}
                                                customPageSize={10}
                                                divClass="table-responsive table-card mb-3"
                                                tableClass="align-middle table-nowrap mb-0"
                                                SearchPlaceholder={
                                                    tr.searchPlaceholder
                                                }
                                            />

                                            {roles.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr.showing}{" "}
                                                        {roleData.length}{" "}
                                                        {tr.of} {roles.total}{" "}
                                                        {tr.results}
                                                    </small>
                                                    <ul className="pagination pagination-sm mb-0">
                                                        {roles.links.map(
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
                                        <div className="text-center py-5 text-muted">
                                            {tr.noData}
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

List.layout = (page: any) => <Layout children={page} />;
export default List;
