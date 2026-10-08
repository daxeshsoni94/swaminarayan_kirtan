import React, { useEffect, useMemo } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import Layout from "../../../../Layouts";

import { toast } from "react-toastify";

/**
 * Get a translated value from a multilingual JSON field.
 */
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

/**
 * Centralized translation helper.
 */
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

interface PlaceFormProps {
    place?: any;
}

const PlaceForm = ({ place = null }: PlaceFormProps) => {
    const page = usePage().props as any;

    const { auth, translations = {}, languages = [], locale } = page;

    const currentLocale = locale || "gu";

    const isEdit = !!place?.id;

    /**
     * Centralized translator.
     */
    const tr = useMemo(() => createTranslator(translations), [translations]);
    const translateError = (error?: string) => {
        if (!error) return "";
        return tr(error);
    };

    /**
     * Dynamic role prefix.
     */
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    /**
     * Create form values dynamically from languages table.
     *
     * No hardcoded en / gu here.
     */
    const initialValue = useMemo(() => {
        return languages.reduce(
            (values: Record<string, string>, language: any) => {
                values[language.code] = place?.value?.[language.code] ?? "";

                return values;
            },
            {},
        );
    }, [languages, place]);

    const { data, setData, post, put, processing, errors } = useForm({
        value: initialValue,
        locale: currentLocale,
    });

    /**
     * Keep form locale synchronized with header language.
     */
    useEffect(() => {
        setData("locale", currentLocale);
    }, [currentLocale]);

    /**
     * Update current language value.
     */
    const setValue = (text: string) => {
        setData("value", {
            ...data.value,
            [currentLocale]: text,
        });
    };

    /**
     * Submit form.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.place.update", {
                    rolePrefix,
                    place: place.id,
                }),
                {
                    onSuccess: () => {
                        // toast.success(
                        //     tr("place_updated_success"),
                        // );
                    },
                    onError: () => {
                        // toast.error(
                        //     tr("please_fix_errors"),
                        // );
                    },
                },
            );
        } else {
            post(
                route("role.category.placestore", {
                    rolePrefix,
                }),
                {
                    onSuccess: () => {
                        // toast.success(
                        //     tr("place_added_success"),
                        // );
                    },
                    onError: () => {
                        // toast.error(
                        //     tr("please_fix_errors"),
                        // );
                    },
                },
            );
        }
    };

    /**
     * Dynamic page title.
     */
    const pageTitle = isEdit ? tr("edit_place") : tr("add_place");

    return (
        <React.Fragment>
            <Head title={pageTitle} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={pageTitle} pageTitle={tr("places")} />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? tr("place_details")
                                            : tr("new_place")}
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
                                                value={tr("place")}
                                                disabled
                                                readOnly
                                            />

                                            <Form.Text className="text-muted">
                                                {tr("place_type_help")}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* Place value */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="place-value">
                                                {tr("place_name")}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                id="place-value"
                                                placeholder={tr(
                                                    "place_name_placeholder",
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

                                        {/* All languages reference */}
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

                                        {/* Buttons */}
                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.placelist",
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

PlaceForm.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default PlaceForm;
