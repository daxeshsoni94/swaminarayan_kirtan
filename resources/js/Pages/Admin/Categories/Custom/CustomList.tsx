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

const tValue = (value: any, locale: string) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        return value?.[locale] ?? Object.values(value)[0] ?? "";
    }
    return String(value);
};

const createTranslator = (translations: Record<string, any>) => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ) => {
        let text = translations?.[key] ?? key;
        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });
        return text;
    };
};

const CustomList = ({ items, filters }: { items: any; filters: any }) => {
    const page = usePage().props as any;
    const { auth, translations = {}, locale } = page;

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const currentLocale = locale || "gu";
    const tr = useMemo(() => createTranslator(translations), [translations]);

    const { can } = usePermission();
    const canCreate = can("categories", "create");
    const canEdit = can("categories", "edit");
    const canDelete = can("categories", "delete");

    const [data, setData] = useState(items?.data ?? []);
    const [item, setItem] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState(false);
    const [search, setSearch] = useState(filters?.search ?? "");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    // From navbar filter: ?custom_type=Kirtan%20Type
    const customType = filters?.custom_type || "";
    const isFilteredByType = customType !== "";

    // Dynamic labels (same idea as Event list)
    const pageTitle = isFilteredByType
        ? customType
        : tr("customs_list_title") ||
          tr("custom_categories") ||
          tr("custom_category");

    const createLabel = isFilteredByType
        ? `${tr("create") || "Create"} ${customType}`
        : tr("create_custom_category") || tr("create_custom");

    const searchPlaceholder = isFilteredByType
        ? tr("search_placeholder")
        : tr("search_custom_placeholder") || tr("search_placeholder");

    const valueColumnLabel = isFilteredByType
        ? customType
        : tr("value_custom") || tr("value") || tr("custom_category");

    const emptyText = isFilteredByType
        ? tr("no_data") || tr("no_custom_categories_found")
        : tr("no_custom_categories_found");

    const { selectedLetter, handleLetterFilter } = useAlphabetFilter(
        "role.category.customcategorylist",
        {
            rolePrefix,
            search: search || undefined,
            custom_type: customType || undefined,
            per_page: 10,
        },
    );

    useEffect(() => {
        setSearch(filters?.search ?? "");
    }, [filters?.search]);

    useEffect(() => {
        if (items?.data) setData(items.data);
    }, [items]);

    const labels = useMemo(
        () => ({
            id: tr("id"),
            type: tr("type"),
            padsCount: tr("total_pads"),
            createdAt: tr("created_at"),
            actions: tr("actions"),
        }),
        [tr],
    );

    const handleEdit = (row: any) => {
        router.visit(
            route("role.category.customcategoryedit", {
                rolePrefix,
                category: row.id,
            }),
        );
    };

    const handleRowClick = (row: any) => {
        router.visit(
            route("role.category.customcategorypads", {
                rolePrefix,
                category: row.id,
            }),
        );
    };

    const onClickDelete = (row: any) => {
        setItem(row);
        setDeleteModal(true);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route("role.category.customcategorylist", { rolePrefix }),
            {
                search: value || undefined,
                letter: selectedLetter || undefined,
                custom_type: customType || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const checkedAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                const allIds = data.map((row: any) => Number(row.id));
                setSelectedIds(allIds);
                setIsMultiDeleteButton(allIds.length > 0);
            } else {
                setSelectedIds([]);
                setIsMultiDeleteButton(false);
            }
        },
        [data],
    );

    const handleDelete = (deleteRelatedPads = false) => {
        if (!item) return;

        router.post(
            route("role.category.customcategorydestroy", {
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
                },
            },
        );
    };

    const deleteMultiple = (deleteRelatedPads = false) => {
        if (!selectedIds.length) {
            toast.warning(tr("select_at_least_one"));
            return;
        }

        router.post(
            route("role.category.customcategorybulkdestroy", { rolePrefix }),
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
                },
            },
        );
    };

    const formatDate = (date: any) => {
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

    const columns = useMemo(
        () => [
            ...(canDelete
                ? [
                      {
                          header: (
                              <input
                                  type="checkbox"
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
            {
                header: labels.id,
                accessorKey: "id",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <span className="fw-medium text-primary">
                        #{gujaratiNumber(cellProps.getValue(), currentLocale)}
                    </span>
                ),
            },
            // Type column only when showing ALL custom categories
            ...(!isFilteredByType
                ? [
                      {
                          header: labels.type,
                          accessorKey: "type",
                          enableColumnFilter: false,
                          cell: (cellProps: any) => {
                              const display = tValue(
                                  cellProps.row.original.type,
                                  currentLocale,
                              );
                              return (
                                  <span
                                      className="fw-medium"
                                      style={{ fontSize: "13px" }}
                                  >
                                      {display || "—"}
                                  </span>
                              );
                          },
                      },
                  ]
                : []),
            {
                header: valueColumnLabel,
                accessorKey: "value",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const display = tValue(
                        cellProps.row.original.value,
                        currentLocale,
                    );
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
            {
                header: labels.padsCount,
                accessorKey: "pads_count",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const count = cellProps.row.original.pads_count ?? 0;
                    return (
                        <span className="badge bg-info-subtle text-info">
                            {gujaratiNumber(count, currentLocale)}
                        </span>
                    );
                },
            },
            {
                header: labels.createdAt,
                accessorKey: "created_at",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <span className="text-muted">
                        {formatDate(cellProps.getValue())}
                    </span>
                ),
            },
            {
                header: labels.actions,
                cell: (cellProps: any) => {
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
                                    <li>
                                        <Dropdown.Item
                                            onClick={() =>
                                                router.visit(
                                                    route(
                                                        "role.category.customcategorypads",
                                                        {
                                                            rolePrefix,
                                                            category: row.id,
                                                        },
                                                    ),
                                                )
                                            }
                                        >
                                            <i className="ri-eye-fill align-bottom me-2 text-muted"></i>
                                            {tr("view")}
                                        </Dropdown.Item>
                                    </li>
                                    {canEdit && (
                                        <li>
                                            <Dropdown.Item
                                                onClick={() => handleEdit(row)}
                                            >
                                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                                                {tr("edit")}
                                            </Dropdown.Item>
                                        </li>
                                    )}
                                    {canDelete && (
                                        <li>
                                            <Dropdown.Item
                                                className="remove-item-btn"
                                                onClick={() =>
                                                    onClickDelete(row)
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
            isFilteredByType,
            valueColumnLabel,
        ],
    );

    return (
        <React.Fragment>
            <Head title={pageTitle} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={pageTitle}
                        pageTitle={tr("categories")}
                    />

                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDelete}
                        onCloseClick={() => setDeleteModal(false)}
                        showPadsOption={true}
                    />
                    <DeleteModal
                        show={deleteModalMulti}
                        onDeleteClick={(deleteRelatedPads: boolean) =>
                            deleteMultiple(deleteRelatedPads)
                        }
                        onCloseClick={() => setDeleteModalMulti(false)}
                        showPadsOption={true}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header className="border-0">
                                    <div className="d-flex align-items-center">
                                        <h5 className="card-title mb-0 flex-grow-1">
                                            {pageTitle}
                                        </h5>
                                        <div className="flex-shrink-0">
                                            <div className="d-flex flex-wrap gap-2">
                                                {canCreate && (
                                                    <button
                                                        className="btn btn-danger add-btn"
                                                        onClick={() => {
                                                            const base = route(
                                                                "role.category.customcategoryform",
                                                                {
                                                                    rolePrefix,
                                                                },
                                                            );
                                                            const href =
                                                                isFilteredByType &&
                                                                customType
                                                                    ? `${base}?custom_type=${encodeURIComponent(customType)}`
                                                                    : base;
                                                            router.visit(href);
                                                        }}
                                                    >
                                                        <i className="ri-add-line align-bottom"></i>{" "}
                                                        {createLabel}
                                                    </button>
                                                )}
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
                                    <div className="d-flex justify-content-end mb-3">
                                        <input
                                            type="search"
                                            className="form-control"
                                            style={{ maxWidth: 280 }}
                                            placeholder={searchPlaceholder}
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

                                    {data && data.length > 0 ? (
                                        <>
                                            <TableContainer
                                                columns={columns}
                                                data={data}
                                                isGlobalFilter={false}
                                                customPageSize={10}
                                                divClass="table-responsive table-card mb-3"
                                                tableClass="align-middle table-nowrap mb-0"
                                                onSearch={handleSearch}
                                                onRowClick={handleRowClick}
                                            />

                                            {items.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr("showing")}{" "}
                                                        {gujaratiNumber(
                                                            data.length,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("of")}{" "}
                                                        {gujaratiNumber(
                                                            items.total,
                                                            currentLocale,
                                                        )}{" "}
                                                        {tr("results")}
                                                    </small>
                                                    <ul className="pagination pagination-sm mb-0">
                                                        {items.links.map(
                                                            (
                                                                link: any,
                                                                idx: number,
                                                            ) => (
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
                                                {emptyText}
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

CustomList.layout = (page: any) => <Layout children={page} />;
export default CustomList;
