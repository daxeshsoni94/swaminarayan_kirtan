import React, { useEffect, useMemo } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import Layout from "../../../../Layouts";

import { toast } from "react-toastify";

/**
 * Get the translated value from a multilingual JSON field.
 *
 * Example:
 * {
 *   en: "Holi",
 *   gu: "હોળી"
 * }
 */
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

/**
 * Centralized translation helper.
 */
const createTranslator = (translations) => {
    return (key, replacements = {}) => {
        let text = translations?.[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });

        return text;
    };
};

const EventForm = ({ event = null }) => {
    const page = usePage().props;

    const { auth, translations = {}, languages = [], locale } = page;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);
    const translateError = (error?: string) => {
        if (!error) return "";
        return tr(error);
    };

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const isEdit = !!event?.id;

    /**
     * Create form values dynamically from the languages table.
     *
     * This avoids:
     *
     * en: ...
     * gu: ...
     *
     * So if Hindi/Marathi/etc. is added later, the form
     * automatically supports it.
     */
    const initialValue = useMemo(() => {
        return languages.reduce((values, language) => {
            values[language.code] = event?.value?.[language.code] ?? "";

            return values;
        }, {});
    }, [languages, event]);

    const { data, setData, post, put, processing, errors } = useForm({
        value: initialValue,
        locale: currentLocale,
    });

    /**
     * Keep form locale synchronized with header language toggle.
     */
    useEffect(() => {
        setData("locale", currentLocale);
    }, [currentLocale]);

    /**
     * Set value for the currently selected language.
     */
    const setValue = (text) => {
        setData("value", {
            ...data.value,
            [currentLocale]: text,
        });
    };

    /**
     * Submit form.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // const options = {
        //     onSuccess: () => {
        //         toast.success(
        //             isEdit
        //                 ? tr("event_updated_success")
        //                 : tr("event_added_success"),
        //         );
        //     },

        //     onError: () => {
        //         toast.error(tr("please_fix_errors"));
        //     },
        // };

        if (isEdit) {
            put(
                route("role.event.update", {
                    rolePrefix,
                    event: event.id,
                }),
            );
        } else {
            post(
                route("role.category.eventstore", {
                    rolePrefix,
                }),
            );
        }
    };

    /**
     * Dynamic page title.
     */
    const pageTitle = isEdit ? tr("edit_event") : tr("add_event");

    return (
        <React.Fragment>
            <Head title={pageTitle} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={pageTitle} pageTitle={tr("events")} />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? tr("event_details")
                                            : tr("new_event")}
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
                                                value={tr("event")}
                                                disabled
                                                readOnly
                                            />

                                            <Form.Text className="text-muted">
                                                {tr("event_type_help")}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* Event value */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="event-value">
                                                {tr("event_name")}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                id="event-value"
                                                placeholder={tr(
                                                    "event_name_placeholder",
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

                                        {/* Buttons */}
                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.eventlist",
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

EventForm.layout = (page) => <Layout children={page} />;

export default EventForm;
