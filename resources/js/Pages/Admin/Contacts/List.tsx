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

interface UserRef {
    id: number;
    name?: string | { en?: string; gu?: string };
}

interface ContactItem {
    id: number;
    user_id: number | null;
    name: string;
    email: string;
    phone: string | null;
    reason_for_contact: string;
    status: "new" | "read" | "resolved";
    user?: UserRef | null;
    created_at?: string;
    updated_at?: string;
}

interface PaginatedContacts {
    data: ContactItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    contacts: PaginatedContacts;
    filters?: {
        search?: string;
        status?: string | null;
    };
}

const translations = {
    en: {
        pageTitle: "Contacts",
        listTitleAll: "All Submissions",
        listTitleNew: "New",
        listTitleRead: "Read",
        listTitleResolved: "Resolved",
        searchPlaceholder: "Search name, email, phone or reason…",
        noData: "No submissions found.",
        showing: "Showing",
        of: "of",
        results: "results",
        id: "ID",
        name: "Name",
        email: "Email",
        phone: "Phone",
        reason: "Reason",
        status: "Status",
        createdAt: "Submitted At",
        actions: "Actions",
        view: "View",
        delete: "Delete",
        statusNew: "New",
        statusRead: "Read",
        statusResolved: "Resolved",
        deleteSuccess: "Contact deleted successfully",
        bulkDeleteSuccess: "Contacts deleted successfully.",
        bulkDeleteFail: "Failed to delete contacts.",
        selectAtLeastOne: "Select at least one item.",
    },
    gu: {
        pageTitle: "સંપર્કો",
        listTitleAll: "બધા સબમિશન",
        listTitleNew: "નવા",
        listTitleRead: "વાંચેલા",
        listTitleResolved: "ઉકેલાયેલા",
        searchPlaceholder: "નામ, ઈમેઈલ, ફોન અથવા કારણ શોધો…",
        noData: "કોઈ સબમિશન મળ્યા નથી.",
        showing: "બતાવી રહ્યા છીએ",
        of: "માંથી",
        results: "પરિણામો",
        id: "ક્રમ",
        name: "નામ",
        email: "ઈમેઈલ",
        phone: "ફોન",
        reason: "કારણ",
        status: "સ્થિતિ",
        createdAt: "સબમિટ તારીખ",
        actions: "ક્રિયાઓ",
        view: "જુઓ",
        delete: "કાઢી નાખો",
        statusNew: "નવું",
        statusRead: "વાંચેલું",
        statusResolved: "ઉકેલાયેલું",
        deleteSuccess: "સંપર્ક સફળતાપૂર્વક કાઢી નાખ્યો",
        bulkDeleteSuccess: "સંપર્કો સફળતાપૂર્વક કાઢી નાખ્યા.",
        bulkDeleteFail: "સંપર્કો કાઢી નાખવામાં નિષ્ફળતા.",
        selectAtLeastOne: "ઓછામાં ઓછું એક આઇટમ પસંદ કરો.",
    },
};

const StatusBadge = ({
    status,
    tr,
}: {
    status: string;
    tr: (typeof translations)["en"];
}) => {
    const map: Record<string, { className: string; label: string }> = {
        new: {
            className: "bg-danger-subtle text-danger",
            label: tr.statusNew,
        },
        read: {
            className: "bg-info-subtle text-info",
            label: tr.statusRead,
        },
        resolved: {
            className: "bg-success-subtle text-success",
            label: tr.statusResolved,
        },
    };
    const item = map[status] ?? map.new;
    return <span className={`badge ${item.className}`}>{item.label}</span>;
};

const List: React.FC<Props> = ({ contacts, filters }) => {
    const page = usePage().props as { locale?: string };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const tr = translations[locale];

    const listTitle =
        filters?.status === "new"
            ? tr.listTitleNew
            : filters?.status === "read"
              ? tr.listTitleRead
              : filters?.status === "resolved"
                ? tr.listTitleResolved
                : tr.listTitleAll;

    const [data, setData] = useState<ContactItem[]>(contacts?.data ?? []);
    const [item, setItem] = useState<ContactItem | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    useEffect(() => {
        if (contacts?.data) setData(contacts.data);
    }, [contacts]);

    useEffect(() => {
        setSelectedIds([]);
        setIsMultiDeleteButton(false);
    }, [contacts?.data]);

    const handleView = (row: ContactItem) => {
        router.visit(
            route("role.contacts.show", {
                rolePrefix: rolePrefix,
                contact: row.id,
            }),
        );
    };
    const onClickDelete = (row: ContactItem) => {
        setItem(row);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (!item) return;

        router.delete(
            route("role.contacts.destroy", {
                rolePrefix: rolePrefix,
                contact: item.id,
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
            route("role.contacts.bulk-destroy", {
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
                header: tr.email,
                accessorKey: "email",
                enableColumnFilter: false,
                cell: (cellProps: any) => <span>{cellProps.getValue()}</span>,
            },
            {
                header: tr.phone,
                accessorKey: "phone",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <span>
                        {cellProps.getValue()
                            ? gujaratiNumber(cellProps.getValue(), locale)
                            : "—"}
                    </span>
                ),
            },
            {
                header: tr.reason,
                accessorKey: "reason_for_contact",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const text = cellProps.getValue() || "";
                    const short =
                        text.length > 40 ? text.slice(0, 40) + "…" : text;
                    return <span className="text-muted">{short}</span>;
                },
            },
            {
                header: tr.status,
                accessorKey: "status",
                enableColumnFilter: false,
                cell: (cellProps: any) => (
                    <StatusBadge status={cellProps.getValue()} tr={tr} />
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
                                            handleView(cellProps.row.original)
                                        }
                                    >
                                        <i className="ri-eye-fill align-bottom me-2 text-muted"></i>
                                        {tr.view}
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
                    <BreadCrumb title={listTitle} pageTitle={tr.pageTitle} />

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
                                                SearchPlaceholder={
                                                    tr.searchPlaceholder
                                                }
                                            />

                                            {contacts.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr.showing}{" "}
                                                        {data.length} {tr.of}{" "}
                                                        {contacts.total}{" "}
                                                        {tr.results}
                                                    </small>
                                                    <ul className="pagination pagination-sm mb-0">
                                                        {contacts.links.map(
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
