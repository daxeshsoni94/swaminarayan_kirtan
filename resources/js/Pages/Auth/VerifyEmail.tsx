import React, { useState } from "react";

import GuestLayout from "../../Layouts/GuestLayout";

import { Head, Link, usePage } from "@inertiajs/react";

import { Card, Col, Container, Row, Button } from "react-bootstrap";

import defaultLogo from "../../../images/logo-light.png";

import LanguageSwitcher from "../../Components/LanguageSwitcher";

export default function VerifyEmail() {
    const { translations = {}, settings = {} } = usePage().props as any;

    const tr = (key: string) => translations[key] ?? key;

    const logoUrl = settings.app_logo
        ? `/storage/${settings.app_logo}`
        : defaultLogo;

    const [digits, setDigits] = useState(["", "", "", ""]);

    const handleChange = (index: number, value: string, inputId: string) => {
        // Allow only numbers
        const digit = value.replace(/\D/g, "").slice(0, 1);

        const updatedDigits = [...digits];
        updatedDigits[index] = digit;

        setDigits(updatedDigits);

        if (digit && index < 3) {
            document.getElementById(`digit${index + 2}-input`)?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            document.getElementById(`digit${index}-input`)?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const code = digits.join("");

        console.log("Verification code:", code);

        // Add your verification route here when the backend is ready.
        // Example:
        // router.post(route("verification.verify"), { code });
    };

    return (
        <div className="auth-page-wrapper">
            <GuestLayout>
                <Head title={tr("verify_email")} />

                {/* Language Switcher */}
                <div className="position-absolute top-0 end-0 p-3 z-3">
                    <LanguageSwitcher />
                </div>

                <div className="auth-page-content">
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

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4">
                                    <Card.Body className="p-4">
                                        <div className="mb-4">
                                            <div className="avatar-lg mx-auto">
                                                <div className="avatar-title bg-light text-primary display-5 rounded-circle">
                                                    <i className="ri-mail-line"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-2 mt-4">
                                            <div className="text-muted text-center mb-4 mx-lg-3">
                                                <h4>{tr("verify_email")}</h4>

                                                <p>
                                                    {tr(
                                                        "verification_code_sent",
                                                    )}{" "}
                                                    <span className="fw-semibold">
                                                        example@abc.com
                                                    </span>
                                                </p>
                                            </div>

                                            <form onSubmit={handleSubmit}>
                                                <Row>
                                                    {digits.map(
                                                        (digit, index) => (
                                                            <Col
                                                                xs={3}
                                                                key={index}
                                                            >
                                                                <div className="mb-3">
                                                                    <label
                                                                        htmlFor={`digit${
                                                                            index +
                                                                            1
                                                                        }-input`}
                                                                        className="visually-hidden"
                                                                    >
                                                                        {tr(
                                                                            "digit",
                                                                        )}{" "}
                                                                        {index +
                                                                            1}
                                                                    </label>

                                                                    <input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        autoComplete={
                                                                            index ===
                                                                            0
                                                                                ? "one-time-code"
                                                                                : "off"
                                                                        }
                                                                        className="form-control form-control-lg bg-light border-light text-center"
                                                                        maxLength={
                                                                            1
                                                                        }
                                                                        id={`digit${
                                                                            index +
                                                                            1
                                                                        }-input`}
                                                                        value={
                                                                            digit
                                                                        }
                                                                        autoFocus={
                                                                            index ===
                                                                            0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleChange(
                                                                                index,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                                `digit${
                                                                                    index +
                                                                                    1
                                                                                }-input`,
                                                                            )
                                                                        }
                                                                        onKeyDown={(
                                                                            e,
                                                                        ) =>
                                                                            handleKeyDown(
                                                                                index,
                                                                                e,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </Col>
                                                        ),
                                                    )}
                                                </Row>

                                                <div className="mt-3">
                                                    <Button
                                                        className="w-100 btn-success"
                                                        type="submit"
                                                        disabled={
                                                            digits.join("")
                                                                .length !== 4
                                                        }
                                                    >
                                                        {tr("confirm")}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <div className="mt-4 text-center">
                                    <p className="mb-0">
                                        {tr("didnt_receive_code")}{" "}
                                        <Link
                                            href={route("password.request")}
                                            className="fw-semibold text-primary text-decoration-underline"
                                        >
                                            {tr("resend")}
                                        </Link>
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </GuestLayout>
        </div>
    );
}
