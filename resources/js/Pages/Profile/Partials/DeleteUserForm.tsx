import React, { useMemo, useRef, useState } from "react";

import { useForm, usePage } from "@inertiajs/react";

import {
    Button,
    Card,
    Col,
    Form,
    Modal,
    Row,
} from "react-bootstrap";

interface PageProps {
    locale?: string;
    translations?: Record<string, any>;
}

interface DeleteUserFormProps {
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

export default function DeleteUserForm({
    className = "",
}: DeleteUserFormProps) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] =
        useState<boolean>(false);

    const passwordInput =
        useRef<HTMLInputElement>(null);

    const { locale, translations = {} } =
        usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const tr = useMemo(
        () => createTranslator(translations),
        [translations],
    );

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: "",
    });

    /**
     * Open confirmation modal
     */
    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);

        setTimeout(() => {
            passwordInput.current?.focus();
        }, 100);
    };

    /**
     * Delete account
     */
    const deleteUser = (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,

            onSuccess: () => {
                closeModal();
            },

            onError: () => {
                passwordInput.current?.focus();
            },

            onFinish: () => {
                reset();
            },
        });
    };

    /**
     * Close confirmation modal
     */
    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <React.Fragment>
            <Row className={className}>
                <Col lg={12}>
                    <h4 className="mb-3">
                        {tr("delete_account")}
                    </h4>

                    <Card>
                        <Card.Body>
                            <p className="text-muted mb-3">
                                {tr("delete_account_description")}
                            </p>

                            <Button
                                variant="danger"
                                onClick={confirmUserDeletion}
                                type="button"
                            >
                                {tr("delete_account")}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Confirmation Modal */}
            <Modal
                show={confirmingUserDeletion}
                onHide={closeModal}
                centered
            >
                <Modal.Header
                    className="bg-light p-3"
                    closeButton
                >
                    <Modal.Title className="fs-5">
                        {tr(
                            "delete_account_confirmation_title",
                        )}
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={deleteUser}>
                    <Modal.Body>
                        <p className="text-muted">
                            {tr(
                                "delete_account_confirmation_description",
                            )}
                        </p>

                        <Form.Label htmlFor="password">
                            {tr("password")}
                        </Form.Label>

                        <Form.Control
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData(
                                    "password",
                                    e.target.value,
                                )
                            }
                            autoComplete="current-password"
                            placeholder={tr(
                                "password_placeholder",
                            )}
                            autoFocus
                            isInvalid={!!errors.password}
                        />

                        {errors.password && (
                            <Form.Control.Feedback
                                type="invalid"
                                className="d-block"
                            >
                                {errors.password}
                            </Form.Control.Feedback>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="light"
                            onClick={closeModal}
                            type="button"
                            disabled={processing}
                        >
                            {tr("cancel")}
                        </Button>

                        <Button
                            variant="danger"
                            disabled={processing}
                            type="submit"
                        >
                            {processing ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                    />

                                    {tr("deleting")}
                                </>
                            ) : (
                                tr("delete_account")
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </React.Fragment>
    );
}