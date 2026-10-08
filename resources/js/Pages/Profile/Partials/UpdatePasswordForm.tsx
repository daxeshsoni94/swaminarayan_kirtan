import React, { useMemo, useRef } from "react";

import { useForm, usePage } from "@inertiajs/react";

import { Button, Card, Col, Form, Row } from "react-bootstrap";

interface PageProps {
    locale?: string;
    translations?: Record<string, any>;
}

interface UpdatePasswordFormProps {
    className?: string;
}

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

const createTranslator = (
    translations: Record<string, any>,
): TranslationFunction => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ): string => {
        let text = translations[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = String(text).replace(
                new RegExp(`:${name}`, "g"),
                String(value),
            );
        });

        return text;
    };
};

export default function UpdatePasswordForm({
    className = "",
}: UpdatePasswordFormProps) {
    const passwordInput =
        useRef<HTMLInputElement>(null);

    const currentPasswordInput =
        useRef<HTMLInputElement>(null);

    const { translations = {} } =
        usePage<PageProps>().props;

    const tr = useMemo(
        () => createTranslator(translations),
        [translations],
    );

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

    /**
     * Update password
     */
    const updatePassword = (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        put(route("password.update"), {
            preserveScroll: true,

            onSuccess: () => {
                reset();
            },

            onError: (formErrors) => {
                if (formErrors.password) {
                    reset(
                        "password",
                        "password_confirmation",
                    );

                    passwordInput.current?.focus();
                }

                if (formErrors.current_password) {
                    reset("current_password");

                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <React.Fragment>
            <Col className={className}>
                <h4 className="mb-3">
                    {tr("update_password")}
                </h4>

                <Card>
                    <Card.Body>
                        <p className="text-muted mb-4">
                            {tr(
                                "update_password_description",
                            )}
                        </p>

                        <Form onSubmit={updatePassword}>
                            <Row>
                                {/* Current Password */}
                                <Col
                                    lg={6}
                                    className="mb-3"
                                >
                                    <Form.Label htmlFor="current_password">
                                        {tr(
                                            "current_password",
                                        )}
                                    </Form.Label>

                                    <Form.Control
                                        id="current_password"
                                        ref={
                                            currentPasswordInput
                                        }
                                        value={
                                            data.current_password
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "current_password",
                                                e.target.value,
                                            )
                                        }
                                        type="password"
                                        autoComplete="current-password"
                                        isInvalid={
                                            !!errors.current_password
                                        }
                                    />

                                    {errors.current_password && (
                                        <div className="text-danger mt-1">
                                            {
                                                errors.current_password
                                            }
                                        </div>
                                    )}
                                </Col>

                                {/* New Password */}
                                <Col
                                    lg={6}
                                    className="mb-3"
                                >
                                    <Form.Label htmlFor="password">
                                        {tr("new_password")}
                                    </Form.Label>

                                    <Form.Control
                                        id="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                        type="password"
                                        autoComplete="new-password"
                                        isInvalid={
                                            !!errors.password
                                        }
                                    />

                                    {errors.password && (
                                        <div className="text-danger mt-1">
                                            {errors.password}
                                        </div>
                                    )}
                                </Col>

                                {/* Confirm Password */}
                                <Col
                                    lg={6}
                                    className="mb-3"
                                >
                                    <Form.Label htmlFor="password_confirmation">
                                        {tr(
                                            "confirm_password",
                                        )}
                                    </Form.Label>

                                    <Form.Control
                                        id="password_confirmation"
                                        value={
                                            data.password_confirmation
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value,
                                            )
                                        }
                                        type="password"
                                        autoComplete="new-password"
                                        isInvalid={
                                            !!errors.password_confirmation
                                        }
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

                                            {tr("saving")}
                                        </>
                                    ) : (
                                        tr("save")
                                    )}
                                </Button>

                                {recentlySuccessful && (
                                    <span className="text-success">
                                        {tr(
                                            "password_updated_successfully",
                                        )}
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