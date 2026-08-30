import React, { useEffect } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";

interface Permission {
    id: number;
    name: string;
    module: string;
    module_name: string;
    action: string;
    display_name: string;
}

interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
}

interface Props {
    role?: Role | null;
    permissions: Record<string, Permission[]>; // grouped by module
}

const translations = {
    en: {
        pageTitleCreate: "Add Role",
        pageTitleEdit: "Edit Role",
        breadcrumbParent: "Roles",
        cardTitleCreate: "New Role",
        cardTitleEdit: "Role Details",
        nameLabel: "Role Name",
        namePlaceholder: "Enter Role Name",
        nameRequired: "Please enter role name",
        permissionsLabel: "Module Permissions",
        selectAll: "Select All",
        deselectAll: "Deselect All",
        cancel: "Cancel",
        save: "Save",
        update: "Update",
        saving: "Saving...",
        createSuccess: "Role created successfully",
        updateSuccess: "Role updated successfully",
        fixErrors: "Please fix the errors.",
    },
    gu: {
        pageTitleCreate: "ભૂમિકા ઉમેરો",
        pageTitleEdit: "ભૂમિકા ફેરફાર કરો",
        breadcrumbParent: "ભૂમિકાઓ",
        cardTitleCreate: "નવી ભૂમિકા",
        cardTitleEdit: "ભૂમિકા વિગતો",
        nameLabel: "ભૂમિકાનું નામ",
        namePlaceholder: "ભૂમિકાનું નામ દાખલ કરો",
        nameRequired: "કૃપા કરીને ભૂમિકાનું નામ દાખલ કરો",
        permissionsLabel: "મોડ્યુલ પરવાનગીઓ",
        selectAll: "બધું પસંદ કરો",
        deselectAll: "બધું રદ કરો",
        cancel: "રદ કરો",
        save: "સાચવો",
        update: "અપડેટ કરો",
        saving: "સાચવી રહ્યા છીએ...",
        createSuccess: "ભૂમિકા સફળતાપૂર્વક બનાવી",
        updateSuccess: "ભૂમિકા સફળતાપૂર્વક અપડેટ થઈ",
        fixErrors: "કૃપા કરીને ભૂલો સુધારો.",
    },
};

const RoleForm: React.FC<Props> = ({ role = null, permissions = {} }) => {
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const page = usePage().props as {
        locale?: string;
        errors?: Record<string, string>;
    };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const tr = translations[locale];
    const isEdit = !!role?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name ?? "",
        permissions: role?.permissions?.map((p) => p.id) ?? ([] as number[]),
    });

    const handlePermissionChange = (permissionId: number) => {
        const current = [...data.permissions];
        const index = current.indexOf(permissionId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permissionId);
        }
        setData("permissions", current);
    };

    const toggleModule = (modulePerms: Permission[], checked: boolean) => {
        const ids = modulePerms.map((p) => p.id);
        if (checked) {
            const merged = Array.from(new Set([...data.permissions, ...ids]));
            setData("permissions", merged);
        } else {
            setData(
                "permissions",
                data.permissions.filter((id) => !ids.includes(id)),
            );
        }
    };

    const isModuleFullySelected = (modulePerms: Permission[]) => {
        return modulePerms.every((p) => data.permissions.includes(p.id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.roles.update", {
                    rolePrefix: rolePrefix,
                    role: role!.id,
                }),
                {
                    onSuccess: () => toast.success(tr.updateSuccess),
                    onError: () => toast.error(tr.fixErrors),
                },
            );
        } else {
            post(
                route("role.roles.store", {
                    rolePrefix: rolePrefix,
                }),
                {
                    onSuccess: () => toast.success(tr.createSuccess),
                    onError: () => toast.error(tr.fixErrors),
                },
            );
        }
    };

    return (
        <React.Fragment>
            <Head title={isEdit ? tr.pageTitleEdit : tr.pageTitleCreate} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={isEdit ? tr.pageTitleEdit : tr.pageTitleCreate}
                        pageTitle={tr.breadcrumbParent}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? tr.cardTitleEdit
                                            : tr.cardTitleCreate}
                                        {/* {isEdit && (
                                            <span
                                                className="badge bg-secondary ms-2"
                                                style={{ fontSize: "10px" }}
                                            >
                                                ID #{role!.id}
                                            </span>
                                        )} */}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            {/* Role Name */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="role-name">
                                                        {tr.nameLabel}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="role-name"
                                                        placeholder={
                                                            tr.namePlaceholder
                                                        }
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                "name",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.name
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.name ||
                                                            tr.nameRequired}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Permissions */}
                                            <Col lg={12}>
                                                <Form.Label className="fw-semibold">
                                                    {tr.permissionsLabel}
                                                </Form.Label>

                                                <div
                                                    className="border rounded p-3"
                                                    style={{
                                                        maxHeight: "480px",
                                                        overflowY: "auto",
                                                    }}
                                                >
                                                    {Object.entries(
                                                        permissions || {},
                                                    ).map(([module, perms]) => (
                                                        <div
                                                            key={module}
                                                            className="mb-4"
                                                        >
                                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                                                                <h6 className="text-uppercase text-muted mb-0">
                                                                    {perms[0]
                                                                        ?.module_name ??
                                                                        module}
                                                                </h6>
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    id={`module-${module}`}
                                                                    label={
                                                                        isModuleFullySelected(
                                                                            perms,
                                                                        )
                                                                            ? tr.deselectAll
                                                                            : tr.selectAll
                                                                    }
                                                                    checked={isModuleFullySelected(
                                                                        perms,
                                                                    )}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        toggleModule(
                                                                            perms,
                                                                            e
                                                                                .target
                                                                                .checked,
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <Row>
                                                                {perms.map(
                                                                    (perm) => (
                                                                        <Col
                                                                            md={
                                                                                6
                                                                            }
                                                                            lg={
                                                                                4
                                                                            }
                                                                            key={
                                                                                perm.id
                                                                            }
                                                                            className="mb-2"
                                                                        >
                                                                            <Form.Check
                                                                                type="checkbox"
                                                                                id={`perm-${perm.id}`}
                                                                                label={
                                                                                    perm.display_name ||
                                                                                    perm.action
                                                                                }
                                                                                checked={data.permissions.includes(
                                                                                    perm.id,
                                                                                )}
                                                                                onChange={() =>
                                                                                    handlePermissionChange(
                                                                                        perm.id,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </Col>
                                                                    ),
                                                                )}
                                                            </Row>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="text-end mt-4">
                                            <Link
                                                href={route("role.roles.list", {
                                                    rolePrefix: rolePrefix,
                                                })}
                                                className="btn btn-secondary me-2"
                                            >
                                                {tr.cancel}
                                            </Link>
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? tr.saving
                                                    : isEdit
                                                      ? tr.update
                                                      : tr.save}
                                            </button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

RoleForm.layout = (page: any) => <Layout children={page} />;
export default RoleForm;
