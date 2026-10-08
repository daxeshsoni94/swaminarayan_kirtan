// resources/js/Pages/Admin/Categories/Creator/CreatorForm.jsx

import React, { useEffect, useMemo } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import Layout from "../../../../Layouts";

import { toast } from "react-toastify";

// ─────────────────────────────────────────────────────────────────────────────
// Resolve multilingual DB value → current locale string
// Example:
// { en: "Bramhanand Swami", gu: "બ્રહ્માનંદ સ્વામી" }
// ─────────────────────────────────────────────────────────────────────────────

const tValue = (value, locale) => {
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
// Centralized translation helper
// Supports:
// translate("creator")
// translate("creator_updated_success")
// translate("pads_of_book", { name: "..." })
// ─────────────────────────────────────────────────────────────────────────────

const createTranslator = (translations) => {
    return (key, replacements = {}) => {
        let text = translations?.[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });

        return text;
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Creator Form
// ─────────────────────────────────────────────────────────────────────────────

const CreatorForm = ({ creator = null }) => {
    const page = usePage().props;

    const { auth, translations = {}, languages = [], locale } = page;

    const currentLocale = locale || "gu";

    const translate = createTranslator(translations);
    const translateError = (error?: string) => {
        if (!error) return "";
        return translate(error);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Dynamic role prefix
    // ─────────────────────────────────────────────────────────────────────────

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    // ─────────────────────────────────────────────────────────────────────────
    // Edit / Create
    // ─────────────────────────────────────────────────────────────────────────

    const isEdit = !!creator?.id;

    // ─────────────────────────────────────────────────────────────────────────
    // Dynamic multilingual initial values
    // ─────────────────────────────────────────────────────────────────────────

    const initialValue = useMemo(() => {
        return languages.reduce((values, language) => {
            values[language.code] = creator?.value?.[language.code] ?? "";

            return values;
        }, {});
    }, [languages, creator]);

    // ─────────────────────────────────────────────────────────────────────────
    // Form
    // ─────────────────────────────────────────────────────────────────────────

    const { data, setData, post, put, processing, errors } = useForm({
        value: initialValue,
        locale: currentLocale,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Keep form locale in sync with header language
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        setData("locale", currentLocale);
    }, [currentLocale]);

    // ─────────────────────────────────────────────────────────────────────────
    // Set current language value
    // ─────────────────────────────────────────────────────────────────────────

    const setValue = (text) => {
        setData("value", {
            ...data.value,
            [currentLocale]: text,
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────────────────────────────────

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.creators.update", {
                    rolePrefix,
                    category: creator.id,
                }),
                {
                    onSuccess: () => {
                        // toast.success(translate("creator_updated_success"));
                    },

                    onError: () => {
                        // toast.error(translate("please_fix_errors"));
                    },
                },
            );
        } else {
            post(
                route("role.creators.store", {
                    rolePrefix,
                }),
                {
                    onSuccess: () => {
                        // toast.success(translate("creator_added_success"));
                    },

                    onError: () => {
                        // toast.error(translate("please_fix_errors"));
                    },
                },
            );
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Page title
    // ─────────────────────────────────────────────────────────────────────────

    const pageTitle = isEdit
        ? translate("edit_creator")
        : translate("add_creator");

    return (
        <React.Fragment>
            <Head title={pageTitle} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={pageTitle}
                        pageTitle={translate("creators")}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                {/* ───────────────────────────────────────── */}
                                {/* Header */}
                                {/* ───────────────────────────────────────── */}

                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? translate("creator_details")
                                            : translate("new_creator")}
                                    </h5>
                                </Card.Header>

                                {/* ───────────────────────────────────────── */}
                                {/* Body */}
                                {/* ───────────────────────────────────────── */}

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        {/* ───────────────────────────────── */}
                                        {/* Type */}
                                        {/* ───────────────────────────────── */}

                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                {translate("type")}
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                value={translate("creator")}
                                                disabled
                                                readOnly
                                            />

                                            <Form.Text className="text-muted">
                                                {translate("creator_type_help")}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* ───────────────────────────────── */}
                                        {/* Creator Name */}
                                        {/* ───────────────────────────────── */}

                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="creator-value">
                                                {translate("creator_name")}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                id="creator-value"
                                                placeholder={translate(
                                                    "creator_name_placeholder",
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
                                                    !!errors?.[
                                                        `value.${currentLocale}`
                                                    ] || !!errors?.value
                                                }
                                            />

                                            <Form.Control.Feedback type="invalid">
                                                {translateError(
                                                    errors?.[
                                                        `value.${currentLocale}`
                                                    ] || errors?.type,
                                                )}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        {/* ───────────────────────────────── */}
                                        {/* All languages reference */}
                                        {/* ───────────────────────────────── */}

                                        <div className="mb-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {translate(
                                                    "both_languages_reference",
                                                )}
                                            </small>

                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{
                                                    fontSize: "13px",
                                                }}
                                            >
                                                {languages.map((language) => (
                                                    <span key={language.code}>
                                                        <strong>
                                                            {language.code.toUpperCase()}
                                                            :
                                                        </strong>{" "}
                                                        {data.value?.[
                                                            language.code
                                                        ] || "—"}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ───────────────────────────────── */}
                                        {/* Buttons */}
                                        {/* ───────────────────────────────── */}

                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.creatorlist",
                                                    {
                                                        rolePrefix,
                                                    },
                                                )}
                                                className="btn btn-secondary me-2"
                                            >
                                                {translate("cancel")}
                                            </Link>

                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? translate("saving")
                                                    : isEdit
                                                      ? translate("update")
                                                      : translate("save")}
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

CreatorForm.layout = (page) => <Layout children={page} />;

export default CreatorForm;
