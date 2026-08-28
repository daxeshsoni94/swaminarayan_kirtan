import React from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";

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

const translations = {
    en: {
        pageTitle: "Contact Details",
        breadcrumbParent: "Contacts",
        name: "Name",
        email: "Email",
        phone: "Phone",
        reason: "Reason for Contact",
        status: "Status",
        submittedAt: "Submitted At",
        back: "Back",
        updateStatus: "Update Status",
        statusNew: "New",
        statusRead: "Read",
        statusResolved: "Resolved",
        statusSuccess: "Status updated successfully",
    },
    gu: {
        pageTitle: "સંપર્ક વિગતો",
        breadcrumbParent: "સંપર્કો",
        name: "નામ",
        email: "ઈમેઈલ",
        phone: "ફોન",
        reason: "સંપર્કનું કારણ",
        status: "સ્થિતિ",
        submittedAt: "સબમિટ તારીખ",
        back: "પાછા",
        updateStatus: "સ્થિતિ અપડેટ કરો",
        statusNew: "નવું",
        statusRead: "વાંચેલું",
        statusResolved: "ઉકેલાયેલું",
        statusSuccess: "સ્થિતિ સફળતાપૂર્વક અપડેટ થઈ",
    },
};

const Show: React.FC<Props> = ({ contact }) => {
    const page = usePage().props as { locale?: string };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const tr = translations[locale];
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const handleStatusChange = (status: string) => {
        router.put(
            route("role.contacts.update-status", {
                rolePrefix: rolePrefix,
                contact: contact.id,
            }),
            { status },
            {
                onSuccess: () => toast.success(tr.statusSuccess),
            },
        );
    };

    return (
        <React.Fragment>
            <Head title={tr.pageTitle} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={tr.pageTitle}
                        pageTitle={tr.breadcrumbParent}
                    />

                    <Row>
                        <Col lg={8}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {tr.pageTitle}{" "}
                                        <span className="badge bg-secondary ms-2">
                                            #{contact.id}
                                        </span>
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <label className="form-label text-muted">
                                                {tr.name}
                                            </label>
                                            <div className="fw-semibold">
                                                {contact.name}
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <label className="form-label text-muted">
                                                {tr.email}
                                            </label>
                                            <div>{contact.email}</div>
                                        </Col>
                                        <Col md={6}>
                                            <label className="form-label text-muted">
                                                {tr.phone}
                                            </label>
                                            <div>{contact.phone || "—"}</div>
                                        </Col>
                                        <Col md={6}>
                                            <label className="form-label text-muted">
                                                {tr.submittedAt}
                                            </label>
                                            <div>
                                                {contact.created_at
                                                    ? new Date(
                                                          contact.created_at,
                                                      ).toLocaleString("en-IN")
                                                    : "—"}
                                            </div>
                                        </Col>
                                        <Col md={12}>
                                            <label className="form-label text-muted">
                                                {tr.reason}
                                            </label>
                                            <div className="p-3 border rounded bg-light">
                                                {contact.reason_for_contact}
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <label className="form-label">
                                                {tr.status}
                                            </label>
                                            <Form.Select
                                                value={contact.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="new">
                                                    {tr.statusNew}
                                                </option>
                                                <option value="read">
                                                    {tr.statusRead}
                                                </option>
                                                <option value="resolved">
                                                    {tr.statusResolved}
                                                </option>
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                    <div className="mt-4">
                                        <Link
                                            href={route("role.contacts.list", {
                                                rolePrefix: rolePrefix,
                                            })}
                                            className="btn btn-secondary"
                                        >
                                            {tr.back}
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
