import React, { useEffect, useState } from "react";

import GuestLayout from "../../Layouts/GuestLayout";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import defaultLogo from "../../../images/logo-light.png";

import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

import LanguageSwitcher from "../../Components/LanguageSwitcher";

export default function Login({ status, canResetPassword }: any) {
    const { translations = {}, settings = {} } = usePage().props as any;

    const tr = (key: string) => translations[key] ?? key;

    // Dynamic logo from General Settings
    // Falls back to the default logo if no logo is configured.
    const logoUrl = settings.app_logo
        ? `/storage/${settings.app_logo}`
        : defaultLogo;

    const [passwordShow, setPasswordShow] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    useEffect(() => {
        return () => reset("password");
    }, []);

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

    //     if (!data.password) {
    //         setError("password", tr("password_required"));
    //         valid = false;
    //     }

    //     if (valid) {
    //         post(route("login"));
    //     }
    // };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        clearErrors();

        if (!data.email) {
            setError("email", tr("email_required"));
            return;
        }

        if (!data.password) {
            setError("password", tr("password_required"));
            return;
        }

        post(route("login"));
    };

    return (
        <GuestLayout>
            <Head title={tr("sign_in")} />

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
                                            {tr("welcome_back")}
                                        </h5>

                                        <p className="text-muted">
                                            {tr("sign_in_continue")}
                                        </p>
                                    </div>

                                    {status && (
                                        <div className="mb-4 text-success">
                                            {status}
                                        </div>
                                    )}

                                    <div className="p-2 mt-4">
                                        <Form onSubmit={submit} noValidate>
                                            {/* Email */}
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
                                                    autoComplete="username"
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

                                            {/* Password */}
                                            <div className="mb-3">
                                                <div className="float-end">
                                                    {canResetPassword && (
                                                        <Link
                                                            href={route(
                                                                "password.request",
                                                            )}
                                                            className="text-muted"
                                                        >
                                                            {tr(
                                                                "forgot_password",
                                                            )}
                                                        </Link>
                                                    )}
                                                </div>

                                                <Form.Label htmlFor="password">
                                                    {tr("password")}
                                                </Form.Label>

                                                <span className="text-danger ms-1">
                                                    *
                                                </span>

                                                <div className="position-relative auth-pass-inputgroup mb-3">
                                                    <Form.Control
                                                        id="password"
                                                        type={
                                                            passwordShow
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        name="password"
                                                        value={data.password}
                                                        placeholder={tr(
                                                            "password_placeholder",
                                                        )}
                                                        required
                                                        className={
                                                            "mt-1 " +
                                                            (errors.password
                                                                ? "is-invalid"
                                                                : "")
                                                        }
                                                        autoComplete="current-password"
                                                        onChange={(e) =>
                                                            setData(
                                                                "password",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />

                                                    <Form.Control.Feedback
                                                        type="invalid"
                                                        className="d-block mt-2"
                                                    >
                                                        {errors.password}
                                                    </Form.Control.Feedback>

                                                    <button
                                                        className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                                        type="button"
                                                        onClick={() =>
                                                            setPasswordShow(
                                                                !passwordShow,
                                                            )
                                                        }
                                                    >
                                                        <i className={passwordShow ? "ri-eye-fill align-middle" : "ri-eye-off-fill align-middle"} />
                                                        {/* <i className={passwordShow ? "ri-eye-off-fill align-middle" : "ri-eye-fill align-middle"} /> */}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Sign In Button */}
                                            <div className="mt-4">
                                                <Button
                                                    type="submit"
                                                    className="btn btn-success w-100"
                                                    disabled={processing}
                                                >
                                                    {tr("sign_in")}
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Register Link */}
                            <div className="mt-4 text-center">
                                <p className="mb-0">
                                    {tr("no_account")}{" "}
                                    <Link
                                        href={route("register")}
                                        className="fw-semibold text-primary text-decoration-underline"
                                    >
                                        {tr("signup_link")}
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
