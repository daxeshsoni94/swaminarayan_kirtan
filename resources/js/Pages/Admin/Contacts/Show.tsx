import React, { useMemo } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import { Head, Link, router, usePage } from "@inertiajs/react";

import Layout from "../../../Layouts";

import { gujaratiNumber } from "../../../utils/number";

interface ContactItem {
    id: number;
    user_id: number | null;
    name: string;
    email: string;
    phone: string | null;
    reason_for_contact: string;
    status: "new" | "read" | "resolved";
    created_at?: string;
}

interface Props {
    contact: ContactItem;
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

const formatDate = (value: any, locale: string): string => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const parts = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).formatToParts(date);

    const day = parts.find((part) => part.type === "day")?.value ?? "";

    const month = parts.find((part) => part.type === "month")?.value ?? "";

    const year = parts.find((part) => part.type === "year")?.value ?? "";

    const formatted = `${day} ${month}, ${year}`;

    return gujaratiNumber(formatted, locale);
};

const Show: React.FC<Props> = ({ contact }) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale } = page;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const handleStatusChange = (status: "new" | "read" | "resolved") => {
        router.put(
            route("role.contacts.update-status", {
                rolePrefix,
                contact: contact.id,
            }),
            { status },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <React.Fragment>
            <Head title={tr("contact_details")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={tr("contact_details")}
                        pageTitle={tr("contacts")}
                    />

                    <Row>
                        <Col lg={8}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {tr("contact_details")}{" "}
                                        <span className="badge bg-secondary ms-2">
                                            #
                                            {gujaratiNumber(
                                                contact.id,
                                                currentLocale,
                                            )}
                                        </span>
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Row className="g-3">
                                        {/* Name */}
                                        <Col md={6}>
                                            <label className="form-label text-muted">
                                                {tr("name")}
                                            </label>

                                            <div className="fw-semibold">
                                                {contact.name}
                                            </div>
                                        </Col>

                                        {/* Email */}
                                        <Col md={6}>
                                            <label className="form-label text-muted">
                                                {tr("email")}
                                            </label>

                                            <div>{contact.email}</div>
                                        </Col>

                                        {/* Phone */}
                                        <Col md={6}>
                                            <label className="form-label text-muted">
                                                {tr("phone")}
                                            </label>

                                            <div>
                                                {contact.phone
                                                    ? gujaratiNumber(
                                                          contact.phone,
                                                          currentLocale,
                                                      )
                                                    : "—"}
                                            </div>
                                        </Col>

                                        {/* Submitted At */}
                                        <Col md={6}>
                                            <label className="form-label text-muted">
                                                {tr("submitted_at")}
                                            </label>

                                            <div>
                                                {formatDate(
                                                    contact.created_at,
                                                    currentLocale,
                                                )}
                                            </div>
                                        </Col>

                                        {/* Reason */}
                                        <Col md={12}>
                                            <label className="form-label text-muted">
                                                {tr("reason")}
                                            </label>

                                            <div className="p-3 border rounded bg-light">
                                                {contact.reason_for_contact}
                                            </div>
                                        </Col>

                                        {/* Status */}
                                        <Col md={6}>
                                            <label className="form-label">
                                                {tr("status")}
                                            </label>

                                            <Form.Select
                                                value={contact.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        e.target.value as
                                                            | "new"
                                                            | "read"
                                                            | "resolved",
                                                    )
                                                }
                                            >
                                                <option value="new">
                                                    {tr("status_new")}
                                                </option>

                                                <option value="read">
                                                    {tr("status_read")}
                                                </option>

                                                <option value="resolved">
                                                    {tr("status_resolved")}
                                                </option>
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                    <div className="mt-4">
                                        <Link
                                            href={route("role.contacts.list", {
                                                rolePrefix,
                                            })}
                                            className="btn btn-secondary"
                                        >
                                            {tr("back")}
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

Show.layout = (page: any) => <Layout children={page} />;

export default Show;
