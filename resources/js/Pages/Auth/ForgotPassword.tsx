import React from "react";

import GuestLayout from "../../Layouts/GuestLayout";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import defaultLogo from "../../../images/logo-light.png";

import {
    Alert,
    Button,
    Card,
    Col,
    Container,
    Form,
    Row,
} from "react-bootstrap";

import LanguageSwitcher from "../../Components/LanguageSwitcher";

export default function ForgotPassword({ status }: any) {
    const { translations = {}, settings = {} } = usePage().props as any;

    const tr = (key: string) => translations[key] ?? key;

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            email: "",
        });

    // const submit = (e: React.FormEvent) => {
    //     e.preventDefault();

    //     let valid = true;
    //     clearErrors();

    //     if (!data.email) {
    //         setError("email", tr("email_required"));
    //         valid = false;
    //     } else if (!/\\S+@\\S+\\.\\S+/.test(data.email)) {
    //         setError("email", tr("invalid_email"));
    //         valid = false;
    //     }

    //     if (valid) {
    //         post(route("password.email"));
    //     }
    // };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        clearErrors();

        if (!data.email) {
            setError("email", tr("email_required"));
            return;
        }

        post(route("password.email"));
    };
    // Dynamic logo from General Settings
    const logoUrl = settings.app_logo
        ? `/storage/${settings.app_logo}`
        : defaultLogo;

    return (
        <GuestLayout>
            <Head title={tr("forgot_password")} />

            {/* Language Switcher */}
            <div className="position-absolute top-0 end-0 p-3 z-3">
                <LanguageSwitcher />
            </div>

            <div className="auth-page-content mt-lg-5">
                <Container>
                    <Row>
                        <Col lg={12}>
                            <div className="text-center mt-sm-5 mb-4 text-white-50">
                                <div>
                                    <Link
                                        href="/"
                                        className="d-inline-block auth-logo"
                                    >
                                        <img
                                            src={logoUrl}
                                            alt={tr("app_logo")}
                                            height="60"
                                            style={{
                                                borderRadius: "30px",
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    defaultLogo;
                                            }}
                                        />
                                    </Link>
                                </div>

                                <p className="mt-3 fs-15 fw-medium">
                                    {tr("auth_tagline")}
                                </p>
                            </div>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5}>
                            <Card className="mt-4">
                                <Card.Body className="p-4">
                                    <div className="text-center mt-2">
                                        <h5 className="text-primary">
                                            {tr("forgot_password")}
                                        </h5>

                                        <p className="text-muted">
                                            {tr("reset_password_description")}
                                        </p>

                                        <i className="ri-mail-send-line display-5 text-success mb-3" />
                                    </div>

                                    <Alert
                                        className="border-0 alert-warning text-center mb-4 mx-2"
                                        role="alert"
                                    >
                                        {tr("reset_password_instruction")}
                                    </Alert>

                                    {status && (
                                        <div className="mb-4 text-success text-center">
                                            {status}
                                        </div>
                                    )}

                                    <div className="p-2">
                                        <Form onSubmit={submit} noValidate>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="email">
                                                    {tr("email")}
                                                </Form.Label>

                                                <span className="text-danger ms-1">
                                                    *
                                                </span>

                                                <Form.Control
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    placeholder={tr(
                                                        "email_placeholder",
                                                    )}
                                                    value={data.email}
                                                    className={
                                                        "mb-1 " +
                                                        (errors.email
                                                            ? "is-invalid"
                                                            : "")
                                                    }
                                                    autoFocus
                                                    required
                                                    onChange={(e) =>
                                                        setData(
                                                            "email",
                                                            e.target.value,
                                                        )
                                                    }
                                                />

                                                <Form.Control.Feedback
                                                    type="invalid"
                                                    className="d-block mt-2"
                                                >
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </div>

                                            <div className="mt-4">
                                                <Button
                                                    className="btn btn-success w-100"
                                                    disabled={processing}
                                                    type="submit"
                                                >
                                                    {tr("send_reset_link")}
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </Card.Body>
                            </Card>

                            <div className="mt-4 text-center">
                                <p className="mb-0">
                                    {tr("remember_password")}{" "}
                                    <Link
                                        href={route("login")}
                                        className="fw-semibold text-primary text-decoration-underline"
                                    >
                                        {tr("click_here")}
                                    </Link>
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </GuestLayout>
    );
}
