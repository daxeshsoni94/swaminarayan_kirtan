import React, { useMemo } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import Layout from "../../../Layouts";

interface Language {
    id: number;
    code: string;
    name: string;
}

interface Props {
    language?: Language | null;
}

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

const LangForm: React.FC<Props> = ({ language = null }) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale } = page;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const isEdit = !!language?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        code: language?.code ?? "",
        name: language?.name ?? "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.languages.update", {
                    rolePrefix,
                    language: language!.id,
                }),
                {
                    preserveScroll: true,
                },
            );
        } else {
            post(
                route("role.languages.store", {
                    rolePrefix,
                }),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const pageTitle = isEdit ? tr("edit_language") : tr("add_language");

    const cardTitle = isEdit ? tr("language_details") : tr("new_language");

    return (
        <React.Fragment>
            <Head title={pageTitle} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={pageTitle} pageTitle={tr("languages")} />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {cardTitle}

                                        {isEdit && (
                                            <span
                                                className="badge bg-secondary ms-2"
                                                style={{
                                                    fontSize: "10px",
                                                }}
                                            >
                                                {tr("id")} #{language!.id}
                                            </span>
                                        )}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            {/* Code */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="language-code">
                                                        {tr("language_code")}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>

                                                    <Form.Control
                                                        type="text"
                                                        id="language-code"
                                                        placeholder={tr(
                                                            "language_code_placeholder",
                                                        )}
                                                        value={data.code}
                                                        onChange={(e) =>
                                                            setData(
                                                                "code",
                                                                e.target.value
                                                                    .toLowerCase()
                                                                    .trim(),
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.code
                                                        }
                                                    />

                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.code ||
                                                            tr(
                                                                "language_code_required",
                                                            )}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Name */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="language-name">
                                                        {tr("language_name")}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>

                                                    <Form.Control
                                                        type="text"
                                                        id="language-name"
                                                        placeholder={tr(
                                                            "language_name_placeholder",
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
                                                    />

                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.name ||
                                                            tr(
                                                                "language_name_required",
                                                            )}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="text-end mt-4">
                                            <Link
                                                href={route(
                                                    "role.languages.list",
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

LangForm.layout = (page: any) => <Layout children={page} />;

export default LangForm;
