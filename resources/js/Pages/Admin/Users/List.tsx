import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    Card,
    Col,
    Container,
    Form,
    Modal,
    Row,
    Dropdown,
} from "react-bootstrap";
import TableContainer from "../../../Components/Common/TableContainer";
import { Head, Link, router, usePage } from "@inertiajs/react";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

// Formik
import * as Yup from "yup";
import { useFormik } from "formik";

import DeleteModal from "../../../Components/Common/DeleteModal";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../../Components/Common/Loader";
import Layout from "../../../Layouts";
import { gujaratiNumber } from "../../../utils/number";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Role {
    id: number;
    name: string;
}

interface Language {
    id: number;
    name: string;
}

interface UserName {
    en?: string;
    gu?: string;
}

interface User {
    id: number;
    name: UserName;
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
    roles: Role[];
    languages: Language[];
    filters: {
        search?: string;
    };
}

// ─── Translations ─────────────────────────────────────────────────────────────

const translations = {
    en: {
        pageTitle: "Users",
        listTitle: "Users List",
        create: "Create User",
        searchPlaceholder: "Search for user name or email…",
        noData: "No users found.",
        showing: "Showing",
        of: "of",
        results: "results",

        // Table headers
        id: "ID",
        name: "Name",
        email: "Email",
        phone: "Phone",
        status: "Status",
        createdAt: "Created At",
        actions: "Actions",

        // Status
        active: "Active",
        blocked: "Block",

        // Actions
        edit: "Edit",
        delete: "Delete",

        // Toasts
        createSuccess: "User created successfully",
        updateSuccess: "User updated successfully",
        deleteSuccess: "User deleted successfully",

        // Modal
        addUser: "Add User",
        editUser: "Edit User",
        close: "Close",
        update: "Update",
        add: "Add User",

        // Form labels
        nameLabel: "Name",
        emailLabel: "Email",
        phoneLabel: "Phone",
        roleLabel: "Role",
        languageLabel: "Language",
        statusLabel: "Status",
        passwordLabel: "Password",
        passwordEditLabel: "Password (leave blank to keep current)",

        // Placeholders
        namePlaceholder: "Enter Name",
        emailPlaceholder: "Enter Email",
        phonePlaceholder: "Enter Phone",
        passwordPlaceholder: "Enter Password",
        selectRole: "Select Role",
        selectLanguage: "Select Language",

        // Status options
        statusActive: "Active",
        statusBlocked: "Blocked",

        // Validation
        nameRequired: "Please Enter Name",
        emailRequired: "Please Enter Email",
        emailInvalid: "Enter a valid email",
        roleRequired: "Please Select Role",
        languageRequired: "Please Select Language",
        statusRequired: "Please Select Status",
        passwordRequired: "Please Enter Password",
        passwordMin: "Password must be at least 6 characters",
    },
    gu: {
        pageTitle: "વપરાશકર્તાઓ",
        listTitle: "વપરાશકર્તા યાદી",
        create: "વપરાશકર્તા બનાવો",
        searchPlaceholder: "નામ અથવા ઈમેઈલ શોધો…",
        noData: "કોઈ વપરાશકર્તા મળ્યા નથી.",
        showing: "બતાવી રહ્યા છીએ",
        of: "માંથી",
        results: "પરિણામો",

        // Table headers
        id: "ક્રમ",
        name: "નામ",
        email: "ઈમેઈલ",
        phone: "ફોન",
        status: "સ્થિતિ",
        createdAt: "બનાવ્યાની તારીખ",
        actions: "ક્રિયાઓ",

        // Status
        active: "પ્રકાશિત",
        blocked: "બ્લોક",

        // Actions
        edit: "ફેરફાર કરો",
        delete: "કાઢી નાખો",

        // Toasts
        createSuccess: "વપરાશકર્તા સફળતાપૂર્વક બનાવ્યો",
        updateSuccess: "વપરાશકર્તા સફળતાપૂર્વક અપડેટ થયો",
        deleteSuccess: "વપરાશકર્તા સફળતાપૂર્વક કાઢી નાખ્યો",

        // Modal
        addUser: "વપરાશકર્તા ઉમેરો",
        editUser: "વપરાશકર્તા ફેરફાર કરો",
        close: "બંધ કરો",
        update: "અપડેટ કરો",
        add: "વપરાશકર્તા ઉમેરો",

        // Form labels
        nameLabel: "નામ",
        emailLabel: "ઈમેઈલ",
        phoneLabel: "ફોન",
        roleLabel: "ભૂમિકા",
        languageLabel: "ભાષા",
        statusLabel: "સ્થિતિ",
        passwordLabel: "પાસવર્ડ",
        passwordEditLabel: "પાસવર્ડ (ખાલી રાખો તો જૂનો રહેશે)",

        // Placeholders
        namePlaceholder: "નામ દાખલ કરો",
        emailPlaceholder: "ઈમેઈલ દાખલ કરો",
        phonePlaceholder: "ફોન દાખલ કરો",
        passwordPlaceholder: "પાસવર્ડ દાખલ કરો",
        selectRole: "ભૂમિકા પસંદ કરો",
        selectLanguage: "ભાષા પસંદ કરો",

        // Status options
        statusActive: "પ્રકાશિત",
        statusBlocked: "બ્લોક",

        // Validation
        nameRequired: "કૃપા કરીને નામ દાખલ કરો",
        emailRequired: "કૃપા કરીને ઈમેઈલ દાખલ કરો",
        emailInvalid: "માન્ય ઈમેઈલ દાખલ કરો",
        roleRequired: "કૃપા કરીને ભૂમિકા પસંદ કરો",
        languageRequired: "કૃપા કરીને ભાષા પસંદ કરો",
        statusRequired: "કૃપા કરીને સ્થિતિ પસંદ કરો",
        passwordRequired: "કૃપા કરીને પાસવર્ડ દાખલ કરો",
        passwordMin: "પાસવર્ડ ઓછામાં ઓછા 6 અક્ષરનો હોવો જોઈએ",
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

const List: React.FC<Props> = ({ users, roles, languages, filters }) => {
    const page = usePage().props as { locale?: string };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const tr = translations[locale];

    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [user, setUser] = useState<any>("");
    const [userData, setUserData] = useState<User[]>(users?.data ?? []);

    // Delete
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);

    // Filters
    const [search, setSearch] = useState(filters?.search ?? "");

    const toggle = useCallback(() => {
        if (modal) {
            setModal(false);
            setUser("");
        } else {
            setModal(true);
            setUser("");
        }
    }, [modal]);

    // validation
    const validation: any = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: (user && user.id) || "",
            name: (user && user.name) || "",
            email: (user && user.email) || "",
            phone: (user && user.phone) || "",
            role_id: (user && user.role_id) || "",
            language_id: user?.language_id || "",
            status: user?.status ?? "unblocked",
            password: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required(tr.nameRequired),
            email: Yup.string()
                .email(tr.emailInvalid)
                .required(tr.emailRequired),
            phone: Yup.string().nullable(),
            role_id: Yup.string().required(tr.roleRequired),
            language_id: Yup.string().required(tr.languageRequired),
            status: Yup.string().required(tr.statusRequired),
            password: isEdit
                ? Yup.string().nullable()
                : Yup.string()
                      .min(6, tr.passwordMin)
                      .required(tr.passwordRequired),
        }),
        onSubmit: (values) => {
            const payload: any = {
                name: values.name,
                email: values.email,
                phone: values.phone,
                role_id: values.role_id,
                language_id: values.language_id,
                status: values.status,
            };
            if (values.password) {
                payload.password = values.password;
            }

            if (isEdit) {
                router.put(route("admin.users.update", user.id), payload, {
                    onSuccess: () => {
                        toast.success(tr.updateSuccess);
                        validation.resetForm();
                    },
                });
            } else {
                router.post(route("admin.users.store"), payload, {
                    onSuccess: () => {
                        toast.success(tr.createSuccess);
                        validation.resetForm();
                    },
                });
            }
            toggle();
        },
    });

    const handleUserClick = (arg: any) => {
        const item = arg;
        setUser({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
            role_id: item.role_id ?? item.role?.id ?? "",
            language_id: item.language_id,
            status: item.status,
        });
        setIsEdit(true);
        setModal(true);
    };

    // Delete Data
    const onClickDelete = (item: any) => {
        setUser(item);
        setDeleteModal(true);
    };

    const handleDeleteUser = () => {
        if (user) {
            router.delete(route("admin.users.destroy", user.id), {
                onSuccess: () => {
                    setDeleteModal(false);
                    toast.success(tr.deleteSuccess);
                },
            });
        }
    };

    // Add Data
    const handleUserClicks = () => {
        setUser("");
        setIsEdit(false);
        toggle();
    };

    // Sync prop changes
    useEffect(() => {
        if (users?.data) setUserData(users.data);
    }, [users]);

    // Server-side filter
    const applyFilters = () => {
        router.get(
            route("admin.users.list"),
            { search },
            { preserveState: true, replace: true },
        );
    };

    // Checked All
    const checkedAll = useCallback(() => {
        const checkall: any = document.getElementById("checkBoxAll");
        const ele = document.querySelectorAll(".userCheckBox");

        if (checkall.checked) {
            ele.forEach((ele: any) => {
                ele.checked = true;
            });
        } else {
            ele.forEach((ele: any) => {
                ele.checked = false;
            });
        }
        deleteCheckbox();
    }, []);

    // Delete Multiple
    const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>(
        [],
    );
    const [isMultiDeleteButton, setIsMultiDeleteButton] =
        useState<boolean>(false);

    const deleteMultiple = () => {
        const checkall: any = document.getElementById("checkBoxAll");
        selectedCheckBoxDelete.forEach((element: any) => {
            router.delete(route("admin.users.destroy", element.value), {
                preserveState: true,
            });
            setTimeout(() => {
                toast.clearWaitingQueue();
            }, 3000);
        });
        setIsMultiDeleteButton(false);
        checkall.checked = false;
    };

    const deleteCheckbox = () => {
        const ele = document.querySelectorAll(".userCheckBox:checked");
        ele.length > 0
            ? setIsMultiDeleteButton(true)
            : setIsMultiDeleteButton(false);
        setSelectedCheckBoxDelete(ele);
    };

    const columns = useMemo(
        () => [
            {
                header: (
                    <Form.Check.Input
                        type="checkbox"
                        id="checkBoxAll"
                        className="form-check-input"
                        onClick={() => checkedAll()}
                    />
                ),
                cell: (cellProps: any) => {
                    return (
                        <Form.Check.Input
                            type="checkbox"
                            className="userCheckBox form-check-input"
                            value={cellProps.row.original.id}
                            onChange={() => deleteCheckbox()}
                        />
                    );
                },
                id: "#",
            },
            {
                header: tr.id,
                accessorKey: "id",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    return (
                        <span className="fw-medium text-primary">
                            #{gujaratiNumber(cellProps.getValue(), locale)}
                        </span>
                    );
                },
            },
            {
                header: tr.name,
                accessorKey: "name",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const rowUser = cellProps.row.original;

                    return (
                        <span className="text-body fw-semibold">
                            {rowUser.name?.[locale] ??
                                rowUser.name?.en ??
                                rowUser.name?.gu ??
                                ""}

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
                header: tr.email,
                accessorKey: "email",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    return <span>{cellProps.getValue()}</span>;
                },
            },
            {
                header: tr.phone,
                accessorKey: "phone",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    return (
                        <span>
                            {gujaratiNumber(cellProps.getValue(), locale) ??
                                "-"}
                        </span>
                    );
                },
            },
            {
                header: tr.status,
                accessorKey: "status",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    return (
                        <StatusBadge
                            status={cellProps.getValue()}
                            tr={tr}
                        />
                    );
                },
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
                cell: (cellProps: any) => {
                    return (
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
                                        className="edit-item-btn"
                                        href="#showModal"
                                        data-bs-toggle="modal"
                                        onClick={() => {
                                            const userRow =
                                                cellProps.row.original;
                                            handleUserClick(userRow);
                                        }}
                                    >
                                        <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                        {tr.edit}
                                    </Dropdown.Item>
                                </li>
                                <li>
                                    <Dropdown.Item
                                        className="remove-item-btn"
                                        data-bs-toggle="modal"
                                        href="#deleteOrder"
                                        onClick={() => {
                                            const userRow =
                                                cellProps.row.original;
                                            onClickDelete(userRow);
                                        }}
                                    >
                                        <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                        {tr.delete}
                                    </Dropdown.Item>
                                </li>
                            </Dropdown.Menu>
                        </Dropdown>
                    );
                },
            },
        ],
        [checkedAll, locale, tr],
    );

    return (
        <React.Fragment>
            <Head title={tr.pageTitle} />
            <div className="page-content">
                <Container fluid>
                    {/* <BreadCrumb title={tr.listTitle} pageTitle={tr.pageTitle} /> */}

                    <DeleteModal
                        show={deleteModal}
                        onDeleteClick={handleDeleteUser}
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
                                                    onClick={handleUserClicks}
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
                                    {userData && userData.length > 0 ? (
                                        <>
                                            <TableContainer
                                                columns={columns}
                                                data={userData || []}
                                                isGlobalFilter={true}
                                                customPageSize={10}
                                                divClass="table-responsive table-card mb-3"
                                                tableClass="align-middle table-nowrap mb-0"
                                                theadClass=""
                                                thClass=""
                                                isKirtanListFilter={true}
                                                SearchPlaceholder={
                                                    tr.searchPlaceholder
                                                }
                                            />

                                            {/* Laravel Pagination */}
                                            {users.last_page > 1 && (
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">
                                                        {tr.showing}{" "}
                                                        {userData.length}{" "}
                                                        {tr.of} {users.total}{" "}
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
                                        <Loader error={null} />
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

            {/* Create / Edit Modal */}
            <Modal
                show={modal}
                onHide={toggle}
                centered
                size="lg"
                className="border-0"
                dialogClassName="zoomIn"
            >
                <Modal.Header className="p-3 bg-info-subtle" closeButton>
                    <h5 className="modal-title">
                        {!!isEdit ? tr.editUser : tr.addUser}
                    </h5>
                </Modal.Header>
                <Form
                    className="tablelist-form"
                    onSubmit={(e: any) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                    }}
                >
                    <Modal.Body>
                        <Row className="g-3">
                            {/* Name */}
                            <Col lg={6}>
                                <div>
                                    <Form.Label
                                        htmlFor="user-name-field"
                                        className="form-label"
                                    >
                                        {tr.nameLabel}
                                    </Form.Label>
                                    <Form.Control
                                        name="name"
                                        id="user-name-field"
                                        className="form-control"
                                        placeholder={tr.namePlaceholder}
                                        type="text"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.name || ""}
                                    />
                                    {validation.touched.name &&
                                    validation.errors.name ? (
                                        <Form.Control.Feedback type="invalid">
                                            {validation.errors.name}
                                        </Form.Control.Feedback>
                                    ) : null}
                                </div>
                            </Col>

                            {/* Email */}
                            <Col lg={6}>
                                <div>
                                    <Form.Label
                                        htmlFor="user-email-field"
                                        className="form-label"
                                    >
                                        {tr.emailLabel}
                                    </Form.Label>
                                    <Form.Control
                                        name="email"
                                        id="user-email-field"
                                        className="form-control"
                                        placeholder={tr.emailPlaceholder}
                                        type="email"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.email || ""}
                                    />
                                    {validation.touched.email &&
                                    validation.errors.email ? (
                                        <Form.Control.Feedback type="invalid">
                                            {validation.errors.email}
                                        </Form.Control.Feedback>
                                    ) : null}
                                </div>
                            </Col>

                            {/* Phone */}
                            <Col lg={6}>
                                <div>
                                    <Form.Label
                                        htmlFor="user-phone-field"
                                        className="form-label"
                                    >
                                        {tr.phoneLabel}
                                    </Form.Label>
                                    <Form.Control
                                        name="phone"
                                        id="user-phone-field"
                                        className="form-control"
                                        placeholder={tr.phonePlaceholder}
                                        type="text"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.phone || ""}
                                    />
                                </div>
                            </Col>

                            {/* Role */}
                            <Col lg={6}>
                                <Form.Label
                                    htmlFor="user-role-field"
                                    className="form-label"
                                >
                                    {tr.roleLabel}
                                </Form.Label>
                                <select
                                    name="role_id"
                                    className="form-select"
                                    id="user-role-field"
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    value={validation.values.role_id || ""}
                                >
                                    <option value="">{tr.selectRole}</option>
                                    {roles?.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                                {validation.touched.role_id &&
                                validation.errors.role_id ? (
                                    <Form.Control.Feedback type="invalid">
                                        {validation.errors.role_id}
                                    </Form.Control.Feedback>
                                ) : null}
                            </Col>

                            <Col lg={6}>
                                <Form.Label>{tr.languageLabel}</Form.Label>

                                <select
                                    name="language_id"
                                    className="form-select"
                                    value={validation.values.language_id}
                                    onChange={validation.handleChange}
                                >
                                    <option value="">{tr.selectLanguage}</option>

                                    {languages.map((language) => (
                                        <option
                                            key={language.id}
                                            value={language.id}
                                        >
                                            {language.name}
                                        </option>
                                    ))}
                                </select>
                            </Col>

                            {/* Status */}
                            <Col lg={6}>
                                <Form.Label
                                    htmlFor="user-status-field"
                                    className="form-label"
                                >
                                    {tr.statusLabel}
                                </Form.Label>
                                <select
                                    name="status"
                                    className="form-select"
                                    id="user-status-field"
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    value={validation.values.status || ""}
                                >
                                    <option value="unblocked">
                                        {tr.statusActive}
                                    </option>
                                    <option value="blocked">
                                        {tr.statusBlocked}
                                    </option>
                                </select>
                                {validation.touched.status &&
                                validation.errors.status ? (
                                    <Form.Control.Feedback type="invalid">
                                        {validation.errors.status}
                                    </Form.Control.Feedback>
                                ) : null}
                            </Col>

                            {/* Password */}
                            <Col lg={6}>
                                <div>
                                    <Form.Label
                                        htmlFor="user-password-field"
                                        className="form-label"
                                    >
                                        {isEdit
                                            ? tr.passwordEditLabel
                                            : tr.passwordLabel}
                                    </Form.Label>
                                    <Form.Control
                                        name="password"
                                        id="user-password-field"
                                        className="form-control"
                                        placeholder={tr.passwordPlaceholder}
                                        type="password"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.password || ""}
                                    />
                                    {validation.touched.password &&
                                    validation.errors.password ? (
                                        <Form.Control.Feedback type="invalid">
                                            {validation.errors.password}
                                        </Form.Control.Feedback>
                                    ) : null}
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>

                    <div className="modal-footer">
                        <div className="hstack gap-2 justify-content-end">
                            <button
                                onClick={toggle}
                                type="button"
                                className="btn btn-light"
                            >
                                {tr.close}
                            </button>
                            <button
                                type="submit"
                                className="btn btn-success"
                                id="add-btn"
                            >
                                {!!isEdit ? tr.update : tr.add}
                            </button>
                        </div>
                    </div>
                </Form>
            </Modal>
        </React.Fragment>
    );
};

List.layout = (page: any) => <Layout children={page} />;
export default List;