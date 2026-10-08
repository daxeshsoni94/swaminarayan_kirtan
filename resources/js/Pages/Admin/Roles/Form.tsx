import React, { useMemo } from "react";
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
    permissions: Record<string, Permission[]>;
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
const RoleForm: React.FC<Props> = ({ role = null, permissions = {} }) => {
    const page = usePage().props as any;
    const {
        auth,
        translations = {},
        permissionTranslations = {},
        locale,
    } = page;
    const tr = useMemo(() => createTranslator(translations), [translations]);
    const currentLocale = locale || "gu";
    // Resolve permission label from permissions.json
    const pt = (module: string, action?: string): string => {
        if (action) {
            return (
                permissionTranslations?.[module]?.[action] ??
                permissionTranslations?.modules?.[module] ??
                `${module}.${action}`
            );
        }
        return permissionTranslations?.modules?.[module] ?? module;
    };
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const isEdit = !!role?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name ?? "",
        permissions:
            role?.permissions?.map((permission) => permission.id) ??
            ([] as number[]),
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
        const ids = modulePerms.map((permission) => permission.id);
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
        return (
            modulePerms.length > 0 &&
            modulePerms.every((permission) =>
                data.permissions.includes(permission.id),
            )
        );
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.roles.update", {
                    rolePrefix,
                    role: role!.id,
                }),
                {
                    preserveScroll: true,
                },
            );
        } else {
            post(
                route("role.roles.store", {
                    rolePrefix,
                }),
                {
                    preserveScroll: true,
                },
            );
        }
    };
    return (
        <>
            {" "}
            <Head title={isEdit ? tr("edit_role") : tr("add_role")} />{" "}
            <div className="page-content">
                {" "}
                <Container fluid>
                    {" "}
                    <BreadCrumb
                        title={isEdit ? tr("edit_role") : tr("add_role")}
                        pageTitle={tr("roles")}
                    />{" "}
                    <Row>
                        {" "}
                        <Col lg={12}>
                            {" "}
                            <Card>
                                {" "}
                                <Card.Header>
                                    {" "}
                                    <h5 className="card-title mb-0">
                                        {" "}
                                        {isEdit
                                            ? tr("role_details")
                                            : tr("new_role")}{" "}
                                    </h5>{" "}
                                </Card.Header>{" "}
                                <Card.Body>
                                    {" "}
                                    <Form onSubmit={handleSubmit}>
                                        {" "}
                                        <Row className="g-3">
                                            {" "}
                                            {/* Role Name */}{" "}
                                            <Col lg={6}>
                                                {" "}
                                                <Form.Group>
                                                    {" "}
                                                    <Form.Label htmlFor="role-name">
                                                        {" "}
                                                        {tr("role_name")}{" "}
                                                        <span className="text-danger">
                                                            {" "}
                                                            *{" "}
                                                        </span>{" "}
                                                    </Form.Label>{" "}
                                                    <Form.Control
                                                        type="text"
                                                        id="role-name"
                                                        placeholder={tr(
                                                            "role_name_placeholder",
                                                        )}
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
                                                    />{" "}
                                                    <Form.Control.Feedback type="invalid">
                                                        {" "}
                                                        {errors.name ||
                                                            tr(
                                                                "role_name_required",
                                                            )}{" "}
                                                    </Form.Control.Feedback>{" "}
                                                </Form.Group>{" "}
                                            </Col>{" "}
                                            {/* Permissions */}{" "}
                                            <Col lg={12}>
                                                {" "}
                                                <Form.Label className="fw-semibold">
                                                    {" "}
                                                    {tr(
                                                        "role_permissions",
                                                    )}{" "}
                                                </Form.Label>{" "}
                                                <div
                                                    className="border rounded p-3"
                                                    style={{
                                                        maxHeight: "480px",
                                                        overflowY: "auto",
                                                    }}
                                                >
                                                    {" "}
                                                    {Object.entries(
                                                        permissions || {},
                                                    ).map(([module, perms]) => {
                                                        const modulePermissions =
                                                            perms as Permission[];
                                                        const isSelected =
                                                            isModuleFullySelected(
                                                                modulePermissions,
                                                            );
                                                        return (
                                                            <div
                                                                key={module}
                                                                className="mb-4"
                                                            >
                                                                {" "}
                                                                <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                                                                    {" "}
                                                                    {/* <h6 className="text-uppercase text-muted mb-0">
                                                                        {" "}
                                                                        {modulePermissions[0]
                                                                            ?.module_name ??
                                                                            module}{" "}
                                                                    </h6>{" "} */}
                                                                    <h6 className="text-uppercase text-muted mb-0">
                                                                        {pt(
                                                                            module,
                                                                        )}
                                                                    </h6>
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        id={`module-${module}`}
                                                                        label={
                                                                            isSelected
                                                                                ? tr(
                                                                                      "role_deselect_all",
                                                                                  )
                                                                                : tr(
                                                                                      "role_select_all",
                                                                                  )
                                                                        }
                                                                        checked={
                                                                            isSelected
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            toggleModule(
                                                                                modulePermissions,
                                                                                e
                                                                                    .target
                                                                                    .checked,
                                                                            )
                                                                        }
                                                                    />{" "}
                                                                </div>{" "}
                                                                <Row>
                                                                    {" "}
                                                                    {modulePermissions.map(
                                                                        (
                                                                            permission,
                                                                        ) => (
                                                                            <Col
                                                                                md={
                                                                                    6
                                                                                }
                                                                                lg={
                                                                                    4
                                                                                }
                                                                                key={
                                                                                    permission.id
                                                                                }
                                                                                className="mb-2"
                                                                            >
                                                                                {" "}
                                                                                <Form.Check
                                                                                    type="checkbox"
                                                                                    id={`perm-${permission.id}`}
                                                                                    label={pt(
                                                                                        permission.module,
                                                                                        permission.action,
                                                                                    )} // ← change this
                                                                                    checked={data.permissions.includes(
                                                                                        permission.id,
                                                                                    )}
                                                                                    onChange={() =>
                                                                                        handlePermissionChange(
                                                                                            permission.id,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </Col>
                                                                        ),
                                                                    )}{" "}
                                                                </Row>{" "}
                                                            </div>
                                                        );
                                                    })}{" "}
                                                </div>{" "}
                                            </Col>{" "}
                                        </Row>{" "}
                                        <div className="text-end mt-4">
                                            {" "}
                                            <Link
                                                href={route("role.roles.list", {
                                                    rolePrefix,
                                                })}
                                                className="btn btn-secondary me-2"
                                            >
                                                {" "}
                                                {tr("cancel")}{" "}
                                            </Link>{" "}
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {" "}
                                                {processing
                                                    ? tr("saving")
                                                    : isEdit
                                                      ? tr("update")
                                                      : tr("save")}{" "}
                                            </button>{" "}
                                        </div>{" "}
                                    </Form>{" "}
                                </Card.Body>{" "}
                            </Card>{" "}
                        </Col>{" "}
                    </Row>{" "}
                </Container>{" "}
            </div>{" "}
        </>
    );
};
RoleForm.layout = (page: any) => <Layout>{page}</Layout>;
export default RoleForm;
