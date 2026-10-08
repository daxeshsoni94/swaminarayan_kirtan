import React, { useEffect, useMemo } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import Layout from "../../../../Layouts";

// import { toast } from "react-toastify";

const BhavForm = ({ bhav = null }: any) => {
    const page = usePage().props as any;

    const { auth, translations = {}, languages = [], locale } = page;

    const currentLocale = locale || languages?.[0]?.code || "en";

    const tr = (
        key: string,
        replacements: Record<string, string | number> = {},
    ) => {
        let text = translations?.[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });

        return text;
    };

    const translateError = (error?: string) => {
        if (!error) return "";
        return tr(error);
    };
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const isEdit = !!bhav?.id;

    // ─────────────────────────────────────────────────────────────────────────
    // Create multilingual value object dynamically
    //
    // If languages table contains:
    // en, gu, hi
    //
    // this automatically creates:
    // {
    //     en: "...",
    //     gu: "...",
    //     hi: "..."
    // }
    // ─────────────────────────────────────────────────────────────────────────

    const initialValue = useMemo(() => {
        return languages.reduce(
            (values: Record<string, string>, language: any) => {
                values[language.code] = bhav?.value?.[language.code] ?? "";

                return values;
            },
            {},
        );
    }, [languages, bhav]);

    const { data, setData, post, put, processing, errors } = useForm({
        value: initialValue,
        locale: currentLocale,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Keep form locale synchronized with header locale
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        setData("locale", currentLocale);
    }, [currentLocale]);

    // ─────────────────────────────────────────────────────────────────────────
    // Set current language value
    // ─────────────────────────────────────────────────────────────────────────

    const setValue = (text: string) => {
        setData("value", {
            ...data.value,
            [currentLocale]: text,
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.category.bhavupdate", {
                    rolePrefix,
                    bhav: bhav.id,
                }),
                {
                    onSuccess: () => {
                        // toast.success(translations.bhav_updated_success ?? "");
                    },

                    onError: () => {
                        // toast.error(translations.please_fix_errors ?? "");
                    },
                },
            );
        } else {
            post(
                route("role.category.bhavstore", {
                    rolePrefix,
                }),
                {
                    onSuccess: () => {
                        // toast.success(translations.bhav_added_success ?? "");
                    },

                    onError: () => {
                        // toast.error(translations.please_fix_errors ?? "");
                    },
                },
            );
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Page title
    // ─────────────────────────────────────────────────────────────────────────

    const pageHeading = isEdit ? tr("edit_bhav") : tr("add_bhav");

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <React.Fragment>
            <Head title={pageHeading} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={pageHeading} pageTitle={tr("bhavs")} />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? (tr("bhav_details") ?? "")
                                            : (tr("new_bhav") ?? "")}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        {/* ─────────────────────────────
                                            Type
                                        ───────────────────────────── */}

                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                {tr("type")}
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                value={tr("bhav") ?? ""}
                                                disabled
                                                readOnly
                                            />

                                            <Form.Text className="text-muted">
                                                {tr("bhav_type_help")}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* ─────────────────────────────
                                            Current language value
                                        ───────────────────────────── */}

                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="bhav-value">
                                                {tr("bhav_name")}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                id="bhav-value"
                                                placeholder={
                                                    tr("bhav_placeholder") ?? ""
                                                }
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
                                                    ] || errors?.value,
                                                )}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        {/* ─────────────────────────────
                                            All languages reference
                                        ───────────────────────────── */}

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

                                        {/* ─────────────────────────────
                                            Buttons
                                        ───────────────────────────── */}

                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.bhavlist",
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

BhavForm.layout = (page: any) => <Layout children={page} />;

export default BhavForm;
