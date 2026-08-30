import React, { useEffect } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";

type Trans = { en: string; gu: string };

interface Role {
    id: number;
    name: string;
}

interface Language {
    id: number;
    name:
        | string
        | {
              en?: string;
              gu?: string;
          };
}

interface UserFormProps {
    user?: {
        id: number;
        name: Trans | string;
        email: string;
        phone: string | null;
        role_id: number | null;
        language_id: number | null;
        status: string;
    } | null;
    roles: Role[];
    languages: Language[];
}

const UserForm = ({
    user = null,
    roles = [],
    languages = [],
}: UserFormProps) => {
    const page = usePage().props as {
        locale?: string;
        errors?: Record<string, string>;
    };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const isGu = locale === "gu";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const isEdit = !!user?.id;

    console.log("LANGUAGES:", languages);
    const resolveName = (name: Trans | string | undefined): Trans => {
        if (!name) return { en: "", gu: "" };
        if (typeof name === "string") return { en: name, gu: name };
        return {
            en: name.en ?? "",
            gu: name.gu ?? "",
        };
    };

    const getLanguageName = (name: Language["name"]) => {
        if (typeof name === "string") {
            return name;
        }

        return name[locale] ?? name.en ?? name.gu ?? "";
    };

    const { data, setData, post, put, processing, errors } = useForm({
        name: resolveName(user?.name),
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        role_id: user?.role_id ?? "",
        language_id: user?.language_id ?? "",
        status: user?.status ?? "unblocked",
        password: "",
        locale,
    });

    useEffect(() => {
        setData("locale", locale);
    }, [locale]);

    const setName = (text: string) => {
        setData("name", {
            ...data.name,
            [locale]: text,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.users.update", {
                    rolePrefix: rolePrefix,
                    user: user!.id,
                }),
                {
                    onSuccess: () =>
                        toast.success(
                            isGu
                                ? "વપરાશકર્તા સફળતાપૂર્વક અપડેટ થયો"
                                : "User updated successfully",
                        ),
                    onError: () =>
                        toast.error(
                            isGu
                                ? "કૃપા કરીને ભૂલો સુધારો."
                                : "Please fix the errors.",
                        ),
                },
            );
        } else {
            post(
                route("role.users.store", {
                    rolePrefix: rolePrefix,
                }),
                {
                    onSuccess: () =>
                        toast.success(
                            isGu
                                ? "વપરાશકર્તા સફળતાપૂર્વક બનાવ્યો"
                                : "User created successfully",
                        ),
                    onError: () =>
                        toast.error(
                            isGu
                                ? "કૃપા કરીને ભૂલો સુધારો."
                                : "Please fix the errors.",
                        ),
                },
            );
        }
    };

    return (
        <React.Fragment>
            <Head
                title={
                    isEdit
                        ? isGu
                            ? "વપરાશકર્તા ફેરફાર કરો"
                            : "Edit User"
                        : isGu
                          ? "વપરાશકર્તા ઉમેરો"
                          : "Add User"
                }
            />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={
                            isEdit
                                ? isGu
                                    ? "વપરાશકર્તા ફેરફાર કરો"
                                    : "Edit User"
                                : isGu
                                  ? "વપરાશકર્તા ઉમેરો"
                                  : "Add User"
                        }
                        pageTitle={isGu ? "વપરાશકર્તાઓ" : "Users"}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? isGu
                                                ? "વપરાશકર્તા વિગતો"
                                                : "User Details"
                                            : isGu
                                              ? "નવો વપરાશકર્તા"
                                              : "New User"}
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            {/* Name – current locale */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="user-name">
                                                        {isGu ? "નામ" : "Name"}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="user-name"
                                                        placeholder={
                                                            isGu
                                                                ? "નામ દાખલ કરો"
                                                                : "Enter Name"
                                                        }
                                                        value={
                                                            data.name[locale] ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors[
                                                                `name.${locale}`
                                                            ] || !!errors.name
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors[
                                                            `name.${locale}`
                                                        ] || errors.name}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Email */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="user-email">
                                                        {isGu
                                                            ? "ઈમેઈલ"
                                                            : "Email"}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        id="user-email"
                                                        placeholder={
                                                            isGu
                                                                ? "ઈમેઈલ દાખલ કરો"
                                                                : "Enter Email"
                                                        }
                                                        value={data.email}
                                                        onChange={(e) =>
                                                            setData(
                                                                "email",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.email
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Phone */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="user-phone">
                                                        {isGu ? "ફોન" : "Phone"}
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="user-phone"
                                                        placeholder={
                                                            isGu
                                                                ? "ફોન દાખલ કરો"
                                                                : "Enter Phone"
                                                        }
                                                        value={data.phone ?? ""}
                                                        onChange={(e) =>
                                                            setData(
                                                                "phone",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.phone
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.phone}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Role */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="user-role">
                                                        {isGu
                                                            ? "ભૂમિકા"
                                                            : "Role"}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        id="user-role"
                                                        value={data.role_id}
                                                        onChange={(e) =>
                                                            setData(
                                                                "role_id",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.role_id
                                                        }
                                                    >
                                                        <option value="">
                                                            {isGu
                                                                ? "ભૂમિકા પસંદ કરો"
                                                                : "Select Role"}
                                                        </option>
                                                        {roles.map((r) => (
                                                            <option
                                                                key={r.id}
                                                                value={r.id}
                                                            >
                                                                {r.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.role_id}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Language */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="user-language">
                                                        {isGu
                                                            ? "ભાષા"
                                                            : "Language"}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        id="user-language"
                                                        value={data.language_id}
                                                        onChange={(e) =>
                                                            setData(
                                                                "language_id",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.language_id
                                                        }
                                                    >
                                                        <option value="">
                                                            {isGu
                                                                ? "ભાષા પસંદ કરો"
                                                                : "Select Language"}
                                                        </option>
                                                        {languages.map((l) => (
                                                            <option
                                                                key={l.id}
                                                                value={l.id}
                                                            >
                                                                {getLanguageName(
                                                                    l.name,
                                                                )}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.language_id}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Status */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="user-status">
                                                        {isGu
                                                            ? "સ્થિતિ"
                                                            : "Status"}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        id="user-status"
                                                        value={data.status}
                                                        onChange={(e) =>
                                                            setData(
                                                                "status",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.status
                                                        }
                                                    >
                                                        <option value="unblocked">
                                                            {isGu
                                                                ? "પ્રકાશિત"
                                                                : "Active"}
                                                        </option>
                                                        <option value="blocked">
                                                            {isGu
                                                                ? "બ્લોક"
                                                                : "Blocked"}
                                                        </option>
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.status}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Password */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="user-password">
                                                        {isEdit
                                                            ? isGu
                                                                ? "પાસવર્ડ (ખાલી રાખો તો જૂનો રહેશે)"
                                                                : "Password (leave blank to keep current)"
                                                            : isGu
                                                              ? "પાસવર્ડ"
                                                              : "Password"}
                                                        {!isEdit && (
                                                            <span className="text-danger">
                                                                {" "}
                                                                *
                                                            </span>
                                                        )}
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        id="user-password"
                                                        placeholder={
                                                            isGu
                                                                ? "પાસવર્ડ દાખલ કરો"
                                                                : "Enter Password"
                                                        }
                                                        value={data.password}
                                                        onChange={(e) =>
                                                            setData(
                                                                "password",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.password
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.password}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Both languages reference */}
                                        <div className="mb-3 mt-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {isGu
                                                    ? "બંને ભાષાઓ (સંદર્ભ)"
                                                    : "Both languages (reference)"}
                                            </small>
                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{ fontSize: "13px" }}
                                            >
                                                <span>
                                                    <strong>EN:</strong>{" "}
                                                    {data.name.en || "—"}
                                                </span>
                                                <span>
                                                    <strong>GU:</strong>{" "}
                                                    {data.name.gu || "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <Link
                                                href={route("role.users.list", {
                                                    rolePrefix: rolePrefix,
                                                })}
                                                className="btn btn-secondary me-2"
                                            >
                                                {isGu ? "રદ કરો" : "Cancel"}
                                            </Link>
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? isGu
                                                        ? "સાચવી રહ્યા છીએ..."
                                                        : "Saving..."
                                                    : isEdit
                                                      ? isGu
                                                          ? "અપડેટ કરો"
                                                          : "Update"
                                                      : isGu
                                                        ? "સાચવો"
                                                        : "Save"}
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

UserForm.layout = (page: any) => <Layout children={page} />;
export default UserForm;
