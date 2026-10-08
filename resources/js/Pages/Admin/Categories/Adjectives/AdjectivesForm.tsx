import React, { useEffect } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import Layout from "../../../../Layouts";

const AdjectivesForm = ({ adjectives = null }: any) => {
    const page = usePage().props as any;

    const {
        auth,
        translations = {},
        languages = [],
        locale,
    } = page;

    const availableLanguages = languages || [];

    // Dynamic current language
    const currentLocale =
        locale || availableLanguages?.[0]?.code || "en";

    /**
     * Central translation helper
     */
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

    /**
     * Translate validation error keys
     */
    const translateError = (error?: string) => {
        if (!error) return "";

        return tr(error);
    };

    const isEdit = !!adjectives?.id;

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    /**
     * Build multilingual value object
     *
     * Example:
     * {
     *     en: "Kind",
     *     gu: "સૌમ્ય"
     * }
     */
    const initialValue = availableLanguages.reduce(
        (
            values: Record<string, string>,
            language: any,
        ) => {
            values[language.code] =
                adjectives?.value?.[language.code] ?? "";

            return values;
        },
        {},
    );

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
    } = useForm({
        value: initialValue,
        locale: currentLocale,
    });

    /**
     * Keep form locale synchronized
     * with the language switcher
     */
    useEffect(() => {
        setData("locale", currentLocale);
    }, [currentLocale]);

    /**
     * Update only the currently selected language
     */
    const setValue = (text: string) => {
        setData("value", {
            ...data.value,
            [currentLocale]: text,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.adjectives.update", {
                    rolePrefix,
                    adjective: adjectives.id,
                }),
            );
        } else {
            post(
                route("role.category.adjectivestore", {
                    rolePrefix,
                }),
            );
        }
    };

    return (
        <React.Fragment>
            <Head
                title={
                    isEdit
                        ? tr("edit_adjective")
                        : tr("new_adjective")
                }
            />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={
                            isEdit
                                ? tr("edit_adjective")
                                : tr("new_adjective")
                        }
                        pageTitle={tr("adjective")}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? tr("adjective_details")
                                            : tr("new_adjective")}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        {/* Type */}
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                {tr("type")}
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                value={tr("adjective")}
                                                disabled
                                                readOnly
                                            />

                                            <Form.Text className="text-muted">
                                                {tr(
                                                    "adjective_type_help",
                                                )}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* Adjective value */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="adjective-value">
                                                {tr("adjective_name")}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                id="adjective-value"
                                                placeholder={tr(
                                                    "adjective_placeholder",
                                                )}
                                                value={
                                                    data.value?.[
                                                        currentLocale
                                                    ] ?? ""
                                                }
                                                onChange={(e) =>
                                                    setValue(
                                                        e.target.value,
                                                    )
                                                }
                                                isInvalid={
                                                    !!errors?.[
                                                        `value.${currentLocale}`
                                                    ] ||
                                                    !!errors?.value
                                                }
                                            />

                                            <Form.Control.Feedback type="invalid">
                                                {translateError(
                                                    errors?.[
                                                        `value.${currentLocale}`
                                                    ] ||
                                                        errors?.value,
                                                )}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        {/* All languages reference */}
                                        <div className="mb-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {tr(
                                                    "both_languages_reference",
                                                )}
                                            </small>

                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{
                                                    fontSize: "13px",
                                                }}
                                            >
                                                {availableLanguages.map(
                                                    (language: any) => (
                                                        <span
                                                            key={
                                                                language.code
                                                            }
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

                                        {/* Buttons */}
                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.adjectivelist",
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

AdjectivesForm.layout = (page: any) => (
    <Layout children={page} />
);

export default AdjectivesForm;