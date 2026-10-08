import React, { useEffect, useState } from "react";
import GuestLayout from "../../Layouts/GuestLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import defaultLogo from "../../../images/logo-light.png";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import LanguageSwitcher from "../../Components/LanguageSwitcher";

export default function Register() {
    const { translations = {}, settings = {} } = usePage().props as any;
    const tr = (key: string) => translations[key] ?? key;

    // Dynamic logo from settings, fallback to static
    const logoUrl = settings.app_logo
        ? `/storage/${settings.app_logo}`
        : defaultLogo;

    const [passwordShow, setPasswordShow] = useState(false);
    const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);

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
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        let valid = true;
        clearErrors();

        if (!data.name) {
            setError("name", tr("name_required"));
            valid = false;
        }

        if (!data.email) {
            setError("email", tr("email_required"));
            valid = false;
        } else if (!data.email.includes("@") || !data.email.includes(".")) {
            setError("email", tr("invalid_email"));
            valid = false;
        }

        if (!data.password) {
            setError("password", tr("password_required"));
            valid = false;
        } else if (data.password.length < 8) {
            setError("password", tr("password_min_length"));
            valid = false;
        }

        if (!data.password_confirmation) {
            setError("password_confirmation", tr("confirm_password_required"));
            valid = false;
        } else if (data.password_confirmation !== data.password) {
            setError("password_confirmation", tr("passwords_must_match"));
            valid = false;
        }

        if (valid) {
            post(route("register"));
        }
    };

    return (
        <GuestLayout>
            <Head title={tr("sign_up")} />

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
                                            src={logoUrl} // ← dynamic
                                            alt=""
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
                                            {tr("create_account")}
                                        </h5>

                                        <p className="text-muted">
                                            {tr("create_account_description")}
                                        </p>
                                    </div>

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

                                            {/* Username */}
                                            <div className="mb-3">
                                                <Form.Label htmlFor="name">
                                                    {tr("username")}
                                                </Form.Label>

                                                <span className="text-danger ms-1">
                                                    *
                                                </span>

                                                <Form.Control
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    placeholder={tr(
                                                        "username_placeholder",
                                                    )}
                                                    value={data.name}
                                                    className={
                                                        "mb-1 " +
                                                        (errors.name
                                                            ? "is-invalid"
                                                            : "")
                                                    }
                                                    autoComplete="name"
                                                    required
                                                    onChange={(e) =>
                                                        setData(
                                                            "name",
                                                            e.target.value,
                                                        )
                                                    }
                                                />

                                                <Form.Control.Feedback
                                                    type="invalid"
                                                    className="d-block mt-2"
                                                >
                                                    {errors.name}
                                                </Form.Control.Feedback>
                                            </div>

                                            {/* Password */}
                                            <div className="mb-3">
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
                                                        autoComplete="new-password"
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
                                                        <i
                                                            className={
                                                                passwordShow
                                                                    ? "ri-eye-fill align-middle"
                                                                    : "ri-eye-off-fill align-middle"
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="mb-3">
                                                <Form.Label htmlFor="password_confirmation">
                                                    {tr("confirm_password")}
                                                </Form.Label>

                                                <span className="text-danger ms-1">
                                                    *
                                                </span>

                                                <div className="position-relative auth-pass-inputgroup mb-3">
                                                    <Form.Control
                                                        id="password_confirmation"
                                                        type={
                                                            confirmPasswordShow
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        name="password_confirmation"
                                                        value={
                                                            data.password_confirmation
                                                        }
                                                        placeholder={tr(
                                                            "confirm_password_placeholder",
                                                        )}
                                                        required
                                                        className={
                                                            "mt-1 " +
                                                            (errors.password_confirmation
                                                                ? "is-invalid"
                                                                : "")
                                                        }
                                                        autoComplete="new-password"
                                                        onChange={(e) =>
                                                            setData(
                                                                "password_confirmation",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />

                                                    <Form.Control.Feedback
                                                        type="invalid"
                                                        className="d-block mt-2"
                                                    >
                                                        {
                                                            errors.password_confirmation
                                                        }
                                                    </Form.Control.Feedback>

                                                    <button
                                                        className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                                        type="button"
                                                        onClick={() =>
                                                            setConfirmPasswordShow(
                                                                !confirmPasswordShow,
                                                            )
                                                        }
                                                    >
                                                        <i
                                                            className={
                                                                confirmPasswordShow
                                                                    ? "ri-eye-off-fill align-middle"
                                                                    : "ri-eye-fill align-middle"
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Sign Up Button */}
                                            <div className="mt-4">
                                                <Button
                                                    type="submit"
                                                    className="btn btn-success w-100"
                                                    disabled={processing}
                                                >
                                                    {tr("sign_up")}
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Login Link */}
                            <div className="mt-4 text-center">
                                <p className="mb-0">
                                    {tr("already_have_account")}{" "}
                                    <Link
                                        href={route("login")}
                                        className="fw-semibold text-primary text-decoration-underline"
                                    >
                                        {tr("sign_in")}
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
