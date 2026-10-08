import React, { useEffect, useState } from "react";

import GuestLayout from "../../Layouts/GuestLayout";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";

import defaultLogo from "../../../images/logo-light.png";

import LanguageSwitcher from "../../Components/LanguageSwitcher";

export default function ConfirmPassword() {
    const { translations = {}, settings = {} } = usePage().props as any;
    const tr = (key: string) => translations[key] ?? key;

    const logoUrl = settings.app_logo
        ? `/storage/${settings.app_logo}`
        : defaultLogo;

    const [passwordShow, setPasswordShow] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route("password.confirm"));
    };

    return (
        <GuestLayout>
            <Head title={tr("confirm_password")} />

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
                                        href={route("login")}
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
                </Container>
            </div>

            <Row className="justify-content-center">
                <Col md={8} lg={6} xl={5}>
                    <Card className="mt-4">
                        <Card.Body className="p-4">
                            <div className="text-center mt-2">
                                <h5 className="text-primary">
                                    {tr("confirm_password")}
                                </h5>

                                <p className="text-muted">
                                    {tr("confirm_password_description")}
                                </p>
                            </div>

                            <div className="p-2 mt-4">
                                <Form onSubmit={submit}>
                                    <div className="mb-3">
                                        <Form.Label
                                            htmlFor="password"
                                            className="form-label"
                                        >
                                            {tr("password")}
                                            <span className="text-danger ms-1">
                                                *
                                            </span>
                                        </Form.Label>

                                        <div className="position-relative auth-pass-inputgroup">
                                            <Form.Control
                                                id="password"
                                                type={
                                                    passwordShow
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                placeholder={tr(
                                                    "password_placeholder",
                                                )}
                                                value={data.password}
                                                className={
                                                    errors.password
                                                        ? "is-invalid pe-5"
                                                        : "pe-5"
                                                }
                                                autoFocus
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                                onClick={() =>
                                                    setPasswordShow(
                                                        !passwordShow,
                                                    )
                                                }
                                                tabIndex={-1}
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

                                        {errors.password && (
                                            <div className="invalid-feedback d-block">
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <Button
                                            type="submit"
                                            className="btn btn-success w-100"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? tr("processing")
                                                : tr("confirm")}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </Card.Body>
                    </Card>

                    <div className="mt-4 text-center">
                        <p className="mb-0">
                            {tr("not_you")}{" "}
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
        </GuestLayout>
    );
}
