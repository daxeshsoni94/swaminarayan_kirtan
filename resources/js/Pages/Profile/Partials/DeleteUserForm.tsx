import React, { useRef, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";

export default function DeleteUserForm({ className = "" }: any) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] =
        useState<boolean>(false);

    const passwordInput = useRef<HTMLInputElement>(null);

    const { locale } = usePage().props as any;

    /*
    |--------------------------------------------------------------------------
    | Translations
    |--------------------------------------------------------------------------
    */

    const labels = {
        en: {
            deleteAccount: "Delete Account",
            description:
                "Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.",
            confirmationTitle:
                "Are you sure you want to delete your account?",
            confirmationDescription:
                "Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.",
            password: "Password",
            passwordPlaceholder: "Enter your password",
            cancel: "Cancel",
            deleting: "Deleting...",
            delete: "Delete Account",
        },

        gu: {
            deleteAccount: "એકાઉન્ટ ડિલીટ કરો",
            description:
                "એકવાર તમારું એકાઉન્ટ ડિલીટ થઈ જાય પછી, તેના તમામ સંસાધનો અને ડેટા કાયમી ધોરણે ડિલીટ થઈ જશે. એકાઉન્ટ ડિલીટ કરતા પહેલાં, જે ડેટા અથવા માહિતી સાચવવી હોય તેનો બેકઅપ લઈ લો.",
            confirmationTitle:
                "શું તમે ખરેખર તમારું એકાઉન્ટ ડિલીટ કરવા માંગો છો?",
            confirmationDescription:
                "એકવાર તમારું એકાઉન્ટ ડિલીટ થઈ જાય પછી, તેના તમામ સંસાધનો અને ડેટા કાયમી ધોરણે ડિલીટ થઈ જશે. તમારું એકાઉન્ટ કાયમી ધોરણે ડિલીટ કરવાની પુષ્ટિ કરવા માટે તમારો પાસવર્ડ દાખલ કરો.",
            password: "પાસવર્ડ",
            passwordPlaceholder: "તમારો પાસવર્ડ દાખલ કરો",
            cancel: "રદ કરો",
            deleting: "ડિલીટ કરી રહ્યા છીએ...",
            delete: "એકાઉન્ટ ડિલીટ કરો",
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
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: "",
    });

    /*
    |--------------------------------------------------------------------------
    | Open Confirmation Modal
    |--------------------------------------------------------------------------
    */

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);

        setTimeout(() => {
            passwordInput.current?.focus();
        }, 100);
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Account
    |--------------------------------------------------------------------------
    */

    const deleteUser = (e: React.FormEvent) => {
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

    /*
    |--------------------------------------------------------------------------
    | Close Modal
    |--------------------------------------------------------------------------
    */

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <React.Fragment>
            <Row>
                <Col lg={12}>
                    {/* Title */}
                    <h4 className="mb-3">
                        {t.deleteAccount}
                    </h4>

                    <Card>
                        <Card.Body>
                            {/* Description */}
                            <p className="text-muted mb-3">
                                {t.description}
                            </p>

                            {/* Delete Button */}
                            <Button
                                variant="danger"
                                onClick={confirmUserDeletion}
                                type="button"
                            >
                                {t.deleteAccount}
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
                        {t.confirmationTitle}
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={deleteUser}>
                    <Modal.Body>
                        <p className="text-muted">
                            {t.confirmationDescription}
                        </p>

                        <Form.Label htmlFor="password">
                            {t.password}
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
                                    e.target.value
                                )
                            }
                            autoComplete="current-password"
                            placeholder={t.passwordPlaceholder}
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
                        {/* Cancel */}
                        <Button
                            variant="light"
                            onClick={closeModal}
                            type="button"
                            disabled={processing}
                        >
                            {t.cancel}
                        </Button>

                        {/* Delete */}
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

                                    {t.deleting}
                                </>
                            ) : (
                                t.delete
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </React.Fragment>
    );
}