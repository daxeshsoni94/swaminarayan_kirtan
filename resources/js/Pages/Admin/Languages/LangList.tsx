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

interface Language {
    id: number;
    code: string;
    name: string;
    created_at?: string;
    users_count?: number;
}

interface PaginatedLanguages {
    data: Language[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    languages: PaginatedLanguages;
    filters?: { search?: string };
}

const translations = {
    en: {
        pageTitle: "Languages",
        listTitle: "Languages List",
        create: "Create Language",
        searchPlaceholder: "Search by name or code…",
        noData: "No languages found.",
        showing: "Showing",
        of: "of",
        results: "results",
        id: "ID",
        code: "Code",
        name: "Name",
        users: "Users",
        createdAt: "Created At",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        deleteSuccess: "Language deleted successfully",
        bulkDeleteSuccess: "Languages deleted successfully.",
        bulkDeleteFail: "Failed to delete languages.",
        selectAtLeastOne: "Select at least one item.",
    },
    gu: {
        pageTitle: "ભાષાઓ",
        listTitle: "ભાષા યાદી",
        create: "ભાષા બનાવો",
        searchPlaceholder: "નામ અથવા કોડ શોધો…",
        noData: "કોઈ ભાષા મળી નથી.",
        showing: "બતાવી રહ્યા છીએ",
        of: "માંથી",
        results: "પરિણામો",
        id: "ક્રમ",
        code: "કોડ",
        name: "નામ",
        users: "વપરાશકર્તાઓ",
        createdAt: "બનાવ્યાની તારીખ",
        actions: "ક્રિયાઓ",
        edit: "ફેરફાર કરો",
        delete: "કાઢી નાખો",
        deleteSuccess: "ભાષા સફળતાપૂર્વક કાઢી નાખી",
        bulkDeleteSuccess: "ભાષાઓ સફળતાપૂર્વક કાઢી નાખી.",
        bulkDeleteFail: "ભાષાઓ કાઢી નાખવામાં નિષ્ફળતા.",
        selectAtLeastOne: "ઓછામાં ઓછું એક આઇટમ પસંદ કરો.",
    },
};

const LangList: React.FC<Props> = ({ languages, filters }) => {
    const page = usePage().props as { locale?: string };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const tr = translations[locale];

    const [data, setData] = useState<Language[]>(languages?.data ?? []);
    const [item, setItem] = useState<Language | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    useEffect(() => {
        if (languages?.data) setData(languages.data);
    }, [languages]);

    useEffect(() => {
        setSelectedIds([]);
        setIsMultiDeleteButton(false);
    }, [languages?.data]);

    const handleCreate = () => {
        router.visit(
            route("role.languages.create", {
                rolePrefix: rolePrefix,
            }),
        );
    };

    const handleEdit = (row: Language) => {
        router.visit(
            route("role.languages.edit", {
                rolePrefix: rolePrefix,
                language: row.id,
            }),
        );
    };

    const onClickDelete = (row: Language) => {
        setItem(row);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (!item) return;

        router.delete(
            route("role.languages.destroy", {
                rolePrefix: rolePrefix,
                language: item.id,
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
            route("role.languages.bulk-destroy", {
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
                header: tr.code,
                accessorKey: "code",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <span className="badge bg-primary-subtle text-primary">
                        {cellProps.getValue()}
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
                header: tr.users,
                accessorKey: "users_count",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <span className="text-muted">
                        {gujaratiNumber(cellProps.getValue() ?? 0, locale)}
                    </span>
                ),
            },
            {
                header: tr.createdAt,
                accessorKey: "created_at",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const value = cellProps.getValue();
                    if (!value) return <span className="text-muted">—</span>;
                    const formattedDate = new Date(value)
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
        [locale, tr, checkedAll, selectedIds, data],
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
                                    {data && data.length > 0 ? (
                                        <>
                                            <TableContainer
                                                columns={columns}
                                                data={data}
                                                isGlobalFilter={true}
                                                customPageSize={10}
                                                divClass="table-responsive table-card mb-3"
                                                tableClass="align-middle table-nowrap mb-0"
                                                SearchPlaceholder={
                                                    tr.searchPlaceholder
                                                }
                                            />

                                            {languages.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr.showing}{" "}
                                                        {data.length} {tr.of}{" "}
                                                        {languages.total}{" "}
                                                        {tr.results}
                                                    </small>
                                                    <ul className="pagination pagination-sm mb-0">
                                                        {languages.links.map(
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

LangList.layout = (page: any) => <Layout children={page} />;
export default LangList;
