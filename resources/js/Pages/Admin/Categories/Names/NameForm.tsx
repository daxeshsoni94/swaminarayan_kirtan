import React, { useEffect, useMemo } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import Layout from "../../../../Layouts";

// ─────────────────────────────────────────────────────────────────────────────
// Translation helper for database multilingual values
// ─────────────────────────────────────────────────────────────────────────────

const tValue = (value: any, locale: string): string => {
    if (value == null) return "";

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        return value[locale] ?? Object.values(value)[0] ?? "";
    }

    return String(value);
};

// ─────────────────────────────────────────────────────────────────────────────
// Translation helper
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Name Form
// ─────────────────────────────────────────────────────────────────────────────

const NameForm = ({ names = null }: { names?: any }) => {
    const page = usePage().props as any;

    const { auth, translations = {}, languages = [], locale } = page;

    const currentLocale = locale || "gu";

    const isEdit = !!names?.id;

    // ─────────────────────────────────────────────────────────────────────
    // Central translator
    // ─────────────────────────────────────────────────────────────────────

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const translateError = (error?: string) => {
        if (!error) return "";
        return tr(error);
    };
    // ─────────────────────────────────────────────────────────────────────
    // Dynamic role prefix
    // ─────────────────────────────────────────────────────────────────────

    const rolePrefix =
        auth?.user?.role?.name?.toLowerCase().replace(/\s+/g, "-") || "admin";

    // ─────────────────────────────────────────────────────────────────────
    // Dynamic multilingual initial values
    // ─────────────────────────────────────────────────────────────────────

    const initialValue = useMemo(() => {
        return languages.reduce(
            (values: Record<string, string>, language: any) => {
                values[language.code] = names?.value?.[language.code] ?? "";

                return values;
            },
            {},
        );
    }, [languages, names]);

    // ─────────────────────────────────────────────────────────────────────
    // Form
    // ─────────────────────────────────────────────────────────────────────

    const { data, setData, post, put, processing, errors } = useForm({
        value: initialValue,
        locale: currentLocale,
    });

    // ─────────────────────────────────────────────────────────────────────
    // Keep form locale in sync with header language
    // ─────────────────────────────────────────────────────────────────────

    useEffect(() => {
        setData("locale", currentLocale);
    }, [currentLocale]);

    // ─────────────────────────────────────────────────────────────────────
    // Current language value setter
    // ─────────────────────────────────────────────────────────────────────

    const setValue = (text: string) => {
        setData("value", {
            ...data.value,
            [currentLocale]: text,
        });
    };

    // ─────────────────────────────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.names.update", {
                    rolePrefix,
                    name: names.id,
                }),
                {
                    onSuccess: () => {
                        // toast.success(tr("name_updated_success"));
                    },

                    onError: () => {
                        // toast.error(tr("please_fix_errors"));
                    },
                },
            );
        } else {
            post(
                route("role.category.namestore", {
                    rolePrefix,
                }),
                {
                    onSuccess: () => {
                        // toast.success(tr("name_added_success"));
                    },

                    onError: () => {
                        // toast.error(tr("please_fix_errors"));
                    },
                },
            );
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // Page title
    // ─────────────────────────────────────────────────────────────────────

    const pageTitle = isEdit ? tr("edit_name") : tr("add_name");

    return (
        <React.Fragment>
            <Head title={pageTitle} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={pageTitle} pageTitle={tr("name")} />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                {/* ─────────────────────────────────── */}
                                {/* Header */}
                                {/* ─────────────────────────────────── */}

                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? tr("name_details")
                                            : tr("new_name")}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        {/* ─────────────────────────────── */}
                                        {/* Type */}
                                        {/* ─────────────────────────────── */}

                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                {tr("type")}
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                value={tr("name")}
                                                disabled
                                                readOnly
                                            />

                                            <Form.Text className="text-muted">
                                                {tr("name_type_help")}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* ─────────────────────────────── */}
                                        {/* Name */}
                                        {/* ─────────────────────────────── */}

                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="name-value">
                                                {tr("name_value")}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                id="name-value"
                                                placeholder={tr(
                                                    "name_value_placeholder",
                                                )}
                                                value={
                                                    data.value?.[
                                                        currentLocale
                                                    ] ?? ""
                                                }
                                                onChange={(e) =>
                                                    setValue(e.target.value)
                                                }
                                                isInvalid={
                                                    !!errors[
                                                        `value.${currentLocale}`
                                                    ] || !!errors.value
                                                }
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {translateError(
                                                    errors?.[
                                                        `value.${currentLocale}`
                                                    ] || errors?.value,
                                                )}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        {/* ─────────────────────────────── */}
                                        {/* All languages reference */}
                                        {/* ─────────────────────────────── */}

                                        <div className="mb-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {tr("both_languages_reference")}
                                            </small>

                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{
                                                    fontSize: "13px",
                                                }}
                                            >
                                                {languages.map(
                                                    (language: any) => (
                                                        <span
                                                            key={language.code}
                                                        >
                                                            <strong>
                                                                {language.code.toUpperCase()}
                                                                :
                                                            </strong>{" "}
                                                            {data.value?.[
                                                                language.code
                                                            ] || "—"}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        {/* ─────────────────────────────── */}
                                        {/* Buttons */}
                                        {/* ─────────────────────────────── */}

                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.namelist",
                                                    {
                                                        rolePrefix,
                                                    },
                                                )}
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

NameForm.layout = (page: any) => <Layout children={page} />;

export default NameForm;
