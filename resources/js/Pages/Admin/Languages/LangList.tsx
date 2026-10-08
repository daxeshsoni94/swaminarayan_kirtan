import React, { useEffect, useMemo, useState, useCallback } from "react";

import { Card, Col, Container, Dropdown, Row } from "react-bootstrap";

import TableContainer from "../../../Components/Common/TableContainer";

import { Head, router, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import DeleteModal from "../../../Components/Common/DeleteModal";

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
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    languages: PaginatedLanguages;
    filters?: {
        search?: string;
    };
}

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

const formatDate = (value: any, locale: string): string => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const formatted = `${day}-${month}-${year}`;

    return gujaratiNumber(formatted, locale);
};

const LangList: React.FC<Props> = ({ languages, filters }) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale } = page;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const [data, setData] = useState<Language[]>(languages?.data ?? []);

    const [item, setItem] = useState<Language | null>(null);

    const [deleteModal, setDeleteModal] = useState(false);

    const [deleteModalMulti, setDeleteModalMulti] = useState(false);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    useEffect(() => {
        if (languages?.data) {
            setData(languages.data);
        }
    }, [languages]);

    useEffect(() => {
        setSelectedIds([]);
        setIsMultiDeleteButton(false);
    }, [languages?.data]);

    const handleCreate = () => {
        router.visit(
            route("role.languages.create", {
                rolePrefix,
            }),
        );
    };

    const handleEdit = (row: Language) => {
        router.visit(
            route("role.languages.edit", {
                rolePrefix,
                language: row.id,
            }),
        );
    };

    const onClickDelete = (row: Language) => {
        setItem(row);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (!item) {
            return;
        }

        router.delete(
            route("role.languages.destroy", {
                rolePrefix,
                language: item.id,
            }),
            {
                onSuccess: () => {
                    setDeleteModal(false);
                    setItem(null);

                    // toast.success(tr("language_deleted_success"));
                },
            },
        );
    };

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

    const deleteMultiple = () => {
        if (!selectedIds.length) {
            // toast.warning(tr("select_at_least_one_language"));

            return;
        }

        router.post(
            route("role.languages.bulk-destroy", {
                rolePrefix,
            }),
            {
                ids: selectedIds,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    // toast.success(tr("languages_deleted_success"));

                    setSelectedIds([]);
                    setIsMultiDeleteButton(false);
                },

                onError: () => {
                    // toast.error(tr("languages_delete_failed"));
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
                header: tr("id"),

                accessorKey: "id",

                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const rowIndex =
                        (languages.current_page - 1) * languages.per_page +
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
                header: tr("language_code"),

                accessorKey: "code",

                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span className="badge bg-primary-subtle text-primary">
                        {cellProps.getValue()}
                    </span>
                ),
            },

            {
                header: tr("language_name"),

                accessorKey: "name",

                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span className="text-body fw-semibold">
                        {cellProps.getValue()}
                    </span>
                ),
            },

            {
                header: tr("users"),

                accessorKey: "users_count",

                enableColumnFilter: false,

                cell: (cellProps: any) => (
                    <span className="text-muted">
                        {gujaratiNumber(
                            cellProps.getValue() ?? 0,
                            currentLocale,
                        )}
                    </span>
                ),
            },

            {
                header: tr("created_at"),

                accessorKey: "created_at",

                enableColumnFilter: false,

                cell: (cellProps: any) => {
                    const value = cellProps.getValue();

                    return (
                        <span className="text-muted">
                            {formatDate(value, currentLocale)}
                        </span>
                    );
                },
            },

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
                                            handleEdit(cellProps.row.original)
                                        }
                                    >
                                        <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>

                                        {tr("edit")}
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
            <Head title={tr("languages")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={tr("languages_list_title")}
                        pageTitle={tr("languages")}
                    />

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
                                            {tr("languages_list_title")}
                                        </h5>

                                        <div className="flex-shrink-0">
                                            <div className="d-flex flex-wrap gap-2">
                                                <button
                                                    className="btn btn-danger add-btn"
                                                    onClick={handleCreate}
                                                >
                                                    <i className="ri-add-line align-bottom"></i>{" "}
                                                    {tr("create_language")}
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
                                                SearchPlaceholder={tr(
                                                    "language_search_placeholder",
                                                )}
                                            />

                                            {languages.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr("showing")}{" "}
                                                        {gujaratiNumber(
                                                            data.length,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("of")}{" "}
                                                        {gujaratiNumber(
                                                            languages.total,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("results")}
                                                    </small>

                                                    <ul className="pagination pagination-sm mb-0">
                                                        {languages.links.map(
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
                                            {tr("no_languages_found")}
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

LangList.layout = (page: any) => <Layout children={page} />;

export default LangList;
