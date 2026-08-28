import React, { useRef } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";

export default function UpdatePasswordForm({ className = "" }: any) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { locale } = usePage().props as any;

    /*
    |--------------------------------------------------------------------------
    | Translations
    |--------------------------------------------------------------------------
    */

    const labels = {
        en: {
            updatePassword: "Update Password",
            description:
                "Ensure your account is using a long, random password to stay secure.",
            currentPassword: "Current Password",
            newPassword: "New Password",
            confirmPassword: "Confirm Password",
            save: "Save",
            saving: "Saving...",
            updated: "Password updated successfully.",
        },

        gu: {
            updatePassword: "પાસવર્ડ અપડેટ કરો",
            description:
                "તમારું એકાઉન્ટ સુરક્ષિત રાખવા માટે લાંબો અને મજબૂત પાસવર્ડ રાખો.",
            currentPassword: "વર્તમાન પાસવર્ડ",
            newPassword: "નવો પાસવર્ડ",
            confirmPassword: "પાસવર્ડની પુષ્ટિ કરો",
            save: "સાચવો",
            saving: "સાચવી રહ્યા છીએ...",
            updated: "પાસવર્ડ સફળતાપૂર્વક અપડેટ થઈ ગયો છે.",
        },
    };

    const t = labels[locale === "gu" ? "gu" : "en"];

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    /*
    |--------------------------------------------------------------------------
    | Update Password
    |--------------------------------------------------------------------------
    */

    const updatePassword = (e: React.FormEvent) => {
        e.preventDefault();

        put(route("password.update"), {
            preserveScroll: true,

            onSuccess: () => {
                reset();
            },

            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");

                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset("current_password");

                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <React.Fragment>
            <Col>
                {/* Title */}
                <h4 className="mb-3">
                    {t.updatePassword}
                </h4>

                <Card>
                    <Card.Body>
                        {/* Description */}
                        <p className="text-muted mb-4">
                            {t.description}
                        </p>

                        <Form onSubmit={updatePassword}>
                            <Row>
                                {/* Current Password */}
                                <Col lg={6} className="mb-3">
                                    <Form.Label htmlFor="current_password">
                                        {t.currentPassword}
                                    </Form.Label>

                                    <Form.Control
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        value={data.current_password}
                                        onChange={(e) =>
                                            setData(
                                                "current_password",
                                                e.target.value
                                            )
                                        }
                                        type="password"
                                        autoComplete="current-password"
                                    />

                                    {errors.current_password && (
                                        <div className="text-danger mt-1">
                                            {errors.current_password}
                                        </div>
                                    )}
                                </Col>

                                {/* New Password */}
                                <Col lg={6} className="mb-3">
                                    <Form.Label htmlFor="password">
                                        {t.newPassword}
                                    </Form.Label>

                                    <Form.Control
                                        id="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        type="password"
                                        autoComplete="new-password"
                                    />

                                    {errors.password && (
                                        <div className="text-danger mt-1">
                                            {errors.password}
                                        </div>
                                    )}
                                </Col>

                                {/* Confirm Password */}
                                <Col lg={6} className="mb-3">
                                    <Form.Label htmlFor="password_confirmation">
                                        {t.confirmPassword}
                                    </Form.Label>

                                    <Form.Control
                                        id="password_confirmation"
                                        value={
                                            data.password_confirmation
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                        type="password"
                                        autoComplete="new-password"
                                    />

                                    {errors.password_confirmation && (
                                        <div className="text-danger mt-1">
                                            {
                                                errors.password_confirmation
                                            }
                                        </div>
                                    )}
                                </Col>
                            </Row>

                            {/* Actions */}
                            <div className="d-flex align-items-center gap-3 mt-3">
                                <Button
                                    variant="success"
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            />

                                            {t.saving}
                                        </>
                                    ) : (
                                        t.save
                                    )}
                                </Button>

                                {recentlySuccessful && (
                                    <span className="text-success">
                                        {t.updated}
                                    </span>
                                )}
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
}