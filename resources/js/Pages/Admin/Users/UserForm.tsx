import React, { useMemo } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../Layouts";
interface Role {
    id: number;
    name: string;
}

interface Language {
    id: number;
    code?: string;
    name:
        | string
        | {
              en?: string;
              gu?: string;
              [key: string]: string | undefined;
          };
}

interface UserFormProps {
    user?: {
        id: number;
        name: Record<string, string> | string;
        email: string;
        phone: string | null;
        role_id: number | null;
        language_id: number | null;
        status: string;
    } | null;
    roles: Role[];
    languages: Language[];
}

const createTranslator = (translations: Record<string, any>) => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ): string => {
        let text = translations[key] ?? key;
        Object.entries(replacements).forEach(([name, value]) => {
            text = String(text).replace(
                new RegExp(`:${name}`, "g"),
                String(value),
            );
        });
        return text;
    };
};

const UserForm = ({
    user = null,
    roles = [],
    languages = [],
}: UserFormProps) => {
    const page = usePage().props as any;
    const { auth, translations = {}, locale: pageLocale } = page;

    const currentLocale = pageLocale || "gu";
    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const isEdit = !!user?.id;

    // Helper to get language display name
    const getLanguageName = (name: Language["name"]) => {
        if (typeof name === "string") {
            return name;
        }

        if (!name) {
            return "";
        }

        return (
            name[currentLocale] ??
            Object.values(name).find(
                (value) => typeof value === "string" && value.trim() !== "",
            ) ??
            ""
        );
    };

    // Dynamic multilingual initial name (supports any languages from DB)
    const initialName = useMemo(() => {
        // If languages have `code`, use it. Fallback to en/gu for older data.
        const codes = languages
            .map((language) => language.code)
            .filter(
                (code): code is string =>
                    typeof code === "string" && code.trim() !== "",
            );

        const result: Record<string, string> = {};

        codes.forEach((code) => {
            if (typeof user?.name === "string") {
                result[code] = user.name;
            } else {
                result[code] = user?.name?.[code] ?? "";
            }
        });

        return result;
    }, [languages, user]);

    const { data, setData, post, put, processing, errors } = useForm({
        name: initialName,
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        role_id: user?.role_id ?? "",
        language_id: user?.language_id ?? "",
        status: user?.status ?? "unblocked",
        password: "",
    });

    // Update only the current locale
    const setName = (text: string) => {
        setData("name", {
            ...data.name,
            [currentLocale]: text,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.users.update", {
                    rolePrefix,
                    user: user!.id,
                }),
                {
                    preserveScroll: true,
                },
            );
        } else {
            post(
                route("role.users.store", {
                    rolePrefix,
                }),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const pageTitle = isEdit ? tr("edit_user") : tr("add_user");
    const cardTitle = isEdit ? tr("user_details") : tr("new_user");

    return (
        <React.Fragment>
            <Head title={pageTitle} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={pageTitle} pageTitle={tr("users")} />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {cardTitle}
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            {/* Name – only current language */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="user-name">
                                                        {tr("name_label")}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="user-name"
                                                        placeholder={tr(
                                                            "name_placeholder",
                                                        )}
                                                        value={
                                                            data.name?.[
                                                                currentLocale
                                                            ] ?? ""
                                                        }
                                                        onChange={(e) =>
                                                            setName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors[
                                                                `name.${currentLocale}`
                                                            ] || !!errors.name
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors[
                                                            `name.${currentLocale}`
                                                        ] || errors.name}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Email */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="user-email">
                                                        {tr("email_label")}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        id="user-email"
                                                        placeholder={tr(
                                                            "email_placeholder",
                                                        )}
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
                                                        {tr("phone_label")}
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="user-phone"
                                                        placeholder={tr(
                                                            "phone_placeholder",
                                                        )}
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
                                                        {tr("role_label")}{" "}
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
                                                            {tr("select_role")}
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
                                                        {tr("language_label")}{" "}
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
                                                            {tr(
                                                                "select_language",
                                                            )}
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
                                                        {tr("status_label")}{" "}
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
                                                            {tr(
                                                                "status_active",
                                                            )}
                                                        </option>
                                                        <option value="blocked">
                                                            {tr(
                                                                "status_blocked",
                                                            )}
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
                                                            ? tr(
                                                                  "password_edit_label",
                                                              )
                                                            : tr(
                                                                  "password_label",
                                                              )}
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
                                                        placeholder={tr(
                                                            "password_placeholder",
                                                        )}
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

                                        {/* All languages reference (dynamic) */}
                                        <div className="mb-3 mt-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {tr("both_languages_reference")}
                                            </small>
                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{ fontSize: "13px" }}
                                            >
                                                {Object.keys(
                                                    data.name || {},
                                                ).map((code) => (
                                                    <span key={code}>
                                                        <strong>
                                                            {code.toUpperCase()}
                                                            :
                                                        </strong>{" "}
                                                        {data.name?.[code] ||
                                                            "—"}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <Link
                                                href={route("role.users.list", {
                                                    rolePrefix,
                                                })}
                                                className="btn btn-secondary me-2"
                                            >
                                                {tr("cancel")}
                                            </Link>
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? tr("saving")
                                                    : isEdit
                                                      ? tr("update")
                                                      : tr("save")}
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
