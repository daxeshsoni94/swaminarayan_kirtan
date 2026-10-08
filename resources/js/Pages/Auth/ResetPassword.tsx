import React, { useState } from "react";
import GuestLayout from "../../Layouts/GuestLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import defaultLogo from "../../../images/logo-light.png";
import LanguageSwitcher from "../../Components/LanguageSwitcher";

interface ResetPasswordProps {
    email: string;
    token: string;
}

const ResetPassword = ({ email, token }: ResetPasswordProps) => {
    const { translations = {}, settings = {} } = usePage().props as any;

    const tr = (key: string) => translations[key] ?? key;

    const logoUrl = settings.app_logo
        ? `/storage/${settings.app_logo}`
        : defaultLogo;

    const [passwordShow, setPasswordShow] = useState(false);
    const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const [errors, setErrors] = useState<{
        password?: string;
        password_confirmation?: string;
    }>({});

    const [processing, setProcessing] = useState(false);

    const validatePassword = () => {
        const newErrors: {
            password?: string;
            password_confirmation?: string;
        } = {};

        if (!password) {
            newErrors.password = tr("password_required");
        } else if (password.length < 8) {
            newErrors.password = tr("password_min_length");
        } else if (!/[a-z]/.test(password)) {
            newErrors.password = tr("password_lowercase");
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = tr("password_uppercase");
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = tr("password_number");
        }

        if (!passwordConfirmation) {
            newErrors.password_confirmation = tr("confirm_password_required");
        } else if (password !== passwordConfirmation) {
            newErrors.password_confirmation = tr("passwords_must_match");
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword()) {
            return;
        }

        setProcessing(true);

        router.post(
            route("password.store"),
            {
                email,
                token,
                password,
                password_confirmation: passwordConfirmation,
            },
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <GuestLayout>
            <Head title={tr("create_new_password")} />

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
                                            {tr("create_new_password")}
                                        </h5>

                                        <p className="text-muted">
                                            {tr("new_password_description")}
                                        </p>
                                    </div>

                                    <div className="p-2 mt-4">
                                        <Form onSubmit={submit}>
                                            {/* Password */}
                                            <div className="mb-3">
                                                <Form.Label htmlFor="password">
                                                    {tr("password")}
                                                </Form.Label>

                                                <span className="text-danger ms-1">
                                                    *
                                                </span>

                                                <div className="position-relative auth-pass-inputgroup">
                                                    <Form.Control
                                                        id="password"
                                                        name="password"
                                                        type={
                                                            passwordShow
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        value={password}
                                                        placeholder={tr(
                                                            "password_placeholder",
                                                        )}
                                                        className={
                                                            "form-control pe-5 password-input " +
                                                            (errors.password
                                                                ? "is-invalid"
                                                                : "")
                                                        }
                                                        autoComplete="new-password"
                                                        onChange={(e) => {
                                                            setPassword(
                                                                e.target.value,
                                                            );

                                                            if (
                                                                errors.password
                                                            ) {
                                                                setErrors(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        password:
                                                                            undefined,
                                                                    }),
                                                                );
                                                            }
                                                        }}
                                                    />

                                                    {errors.password && (
                                                        <Form.Control.Feedback
                                                            type="invalid"
                                                            className="d-block"
                                                        >
                                                            {errors.password}
                                                        </Form.Control.Feedback>
                                                    )}

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
                                                        name="password_confirmation"
                                                        type={
                                                            confirmPasswordShow
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        value={
                                                            passwordConfirmation
                                                        }
                                                        placeholder={tr(
                                                            "confirm_password_placeholder",
                                                        )}
                                                        className={
                                                            "form-control pe-5 password-input " +
                                                            (errors.password_confirmation
                                                                ? "is-invalid"
                                                                : "")
                                                        }
                                                        autoComplete="new-password"
                                                        onChange={(e) => {
                                                            setPasswordConfirmation(
                                                                e.target.value,
                                                            );

                                                            if (
                                                                errors.password_confirmation
                                                            ) {
                                                                setErrors(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        password_confirmation:
                                                                            undefined,
                                                                    }),
                                                                );
                                                            }
                                                        }}
                                                    />

                                                    {errors.password_confirmation && (
                                                        <Form.Control.Feedback
                                                            type="invalid"
                                                            className="d-block"
                                                        >
                                                            {
                                                                errors.password_confirmation
                                                            }
                                                        </Form.Control.Feedback>
                                                    )}

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
                                                                    ? "ri-eye-fill align-middle"
                                                                    : "ri-eye-off-fill align-middle"
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Password Requirements */}
                                            <div
                                                id="password-contain"
                                                className="p-3 bg-light mb-2 rounded"
                                            >
                                                <h5 className="fs-13">
                                                    {tr(
                                                        "password_must_contain",
                                                    )}
                                                </h5>

                                                <p
                                                    className={
                                                        "fs-12 mb-2 " +
                                                        (password.length >= 8
                                                            ? "text-success"
                                                            : "text-muted")
                                                    }
                                                >
                                                    Minimum <b>8 characters</b>
                                                </p>

                                                <p
                                                    className={
                                                        "fs-12 mb-2 " +
                                                        (/[a-z]/.test(password)
                                                            ? "text-success"
                                                            : "text-muted")
                                                    }
                                                >
                                                    At least <b>lowercase</b>{" "}
                                                    letter (a-z)
                                                </p>

                                                <p
                                                    className={
                                                        "fs-12 mb-2 " +
                                                        (/[A-Z]/.test(password)
                                                            ? "text-success"
                                                            : "text-muted")
                                                    }
                                                >
                                                    At least <b>uppercase</b>{" "}
                                                    letter (A-Z)
                                                </p>

                                                <p
                                                    className={
                                                        "fs-12 mb-0 " +
                                                        (/[0-9]/.test(password)
                                                            ? "text-success"
                                                            : "text-muted")
                                                    }
                                                >
                                                    At least <b>number</b> (0-9)
                                                </p>
                                            </div>

                                            {/* Reset Password Button */}
                                            <div className="mt-4">
                                                <Button
                                                    className="w-100 btn-success"
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    {tr("reset_password")}
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Back to Login */}
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
};

export default ResetPassword;
