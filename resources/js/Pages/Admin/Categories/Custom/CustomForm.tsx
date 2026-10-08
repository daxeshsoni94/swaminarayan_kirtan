import React, { useEffect, useMemo } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../../Layouts";

const createTranslator = (translations: Record<string, any>) => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ) => {
        let text = translations?.[key] ?? key;
        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });
        return text;
    };
};

const CustomForm = ({ custom = null }: { custom?: any }) => {
    const page = usePage().props as any;
    const { auth, translations = {}, languages = [], locale } = page;

    const currentLocale = locale || "gu";
    const translate = createTranslator(translations);
    const translateError = (error?: string) => {
        if (!error) return "";
        return translate(error);
    };

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const isEdit = !!custom?.id;

    const initialType = useMemo(() => {
        return languages.reduce(
            (values: Record<string, string>, language: any) => {
                values[language.code] = custom?.type?.[language.code] ?? "";
                return values;
            },
            {},
        );
    }, [languages, custom]);

    const initialValue = useMemo(() => {
        return languages.reduce(
            (values: Record<string, string>, language: any) => {
                values[language.code] = custom?.value?.[language.code] ?? "";
                return values;
            },
            {},
        );
    }, [languages, custom]);

    const { data, setData, post, put, processing, errors } = useForm({
        type: initialType,
        value: initialValue,
        locale: currentLocale,
    });

    useEffect(() => {
        setData("locale", currentLocale);
    }, [currentLocale]);

    const setType = (text: string) => {
        setData("type", {
            ...data.type,
            [currentLocale]: text,
        });
    };

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
                route("role.category.customcategoryupdate", {
                    rolePrefix,
                    category: custom.id,
                }),
            );
        } else {
            post(
                route("role.category.customcategorystore", {
                    rolePrefix,
                }),
            );
        }
    };

    const pageTitle = isEdit
        ? translate("edit_custom_category")
        : translate("add_custom_category");

    return (
        <React.Fragment>
            <Head title={pageTitle} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={pageTitle}
                        pageTitle={translate("custom_category")}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? translate(
                                                  "custom_category_details",
                                              )
                                            : translate("new_custom_category")}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        {/* Type (editable) */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="custom-type">
                                                {translate("type")}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="custom-type"
                                                placeholder={translate(
                                                    "type_placeholder",
                                                )}
                                                value={
                                                    data.type?.[
                                                        currentLocale
                                                    ] ?? ""
                                                }
                                                onChange={(e) =>
                                                    setType(e.target.value)
                                                }
                                                isInvalid={
                                                    !!errors?.[
                                                        `type.${currentLocale}`
                                                    ] || !!errors?.type
                                                }
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {translateError(
                                                    errors?.[
                                                        `type.${currentLocale}`
                                                    ] || errors?.type,
                                                )}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        {/* Value */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="custom-value">
                                                {translate("value_custom")}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="custom-value"
                                                placeholder={translate(
                                                    "value_placeholder",
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
                                                        `type.${currentLocale}`
                                                    ] || errors?.type,
                                                )}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        {/* All languages reference */}
                                        <div className="mb-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {translate(
                                                    "both_languages_reference",
                                                )}
                                            </small>
                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{ fontSize: "13px" }}
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
                                                            {data.type?.[
                                                                language.code
                                                            ] || "—"}{" "}
                                                            /{" "}
                                                            {data.value?.[
                                                                language.code
                                                            ] || "—"}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.customcategorylist",
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

CustomForm.layout = (page: any) => <Layout children={page} />;
export default CustomForm;
