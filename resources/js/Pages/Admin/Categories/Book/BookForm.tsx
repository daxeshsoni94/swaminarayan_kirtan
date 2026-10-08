import React, { useEffect, useMemo } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import Layout from "../../../../Layouts";

// import { toast } from "react-toastify";

const BookForm = ({ book = null }: any) => {
    const page = usePage().props as any;

    const { auth, translations = {}, languages = [], locale } = page;

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const isEdit = !!book?.id;

    // ─────────────────────────────────────────────
    // Create multilingual initial value dynamically
    // from languages table
    // ─────────────────────────────────────────────
    const initialValue = useMemo(() => {
        return languages.reduce(
            (values: Record<string, string>, language: any) => {
                values[language.code] = book?.value?.[language.code] ?? "";

                return values;
            },
            {},
        );
    }, [languages, book]);

    const { data, setData, post, put, processing, errors } = useForm({
        value: initialValue,
        locale,
    });

    // ─────────────────────────────────────────────
    // Keep form locale synced with header locale
    // ─────────────────────────────────────────────
    useEffect(() => {
        setData("locale", locale);
    }, [locale]);

    // ─────────────────────────────────────────────
    // Update current language value
    // ─────────────────────────────────────────────
    const setValue = (text: string) => {
        setData("value", {
            ...data.value,
            [locale]: text,
        });
    };

    // ─────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.category.bookupdate", {
                    rolePrefix: rolePrefix,
                    book: book.id,
                }),
            );
        } else {
            post(
                route("role.category.bookstore", {
                    rolePrefix: rolePrefix,
                }),
            );
        }
    };
    // ─────────────────────────────────────────────
    // Dynamic page heading
    // ─────────────────────────────────────────────
    const pageHeading = isEdit
        ? (translations.edit_book ?? "")
        : (translations.add_book ?? "");

    return (
        <React.Fragment>
            <Head title={pageHeading} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={pageHeading}
                        pageTitle={translations.books ?? ""}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? (translations.book_details ?? "")
                                            : (translations.new_book ?? "")}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        {/* Type */}
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                {translations.type}
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                value={translations.book ?? ""}
                                                disabled
                                                readOnly
                                            />

                                            <Form.Text className="text-muted">
                                                {translations.book_type_help}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* Book name */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="book-value">
                                                {translations.book_name}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                id="book-value"
                                                placeholder={
                                                    translations.book_placeholder ??
                                                    ""
                                                }
                                                value={
                                                    data.value?.[locale] ?? ""
                                                }
                                                onChange={(e) =>
                                                    setValue(e.target.value)
                                                }
                                                isInvalid={
                                                    !!errors[
                                                        `value.${locale}`
                                                    ] || !!errors.value
                                                }
                                            />

                                            <Form.Control.Feedback type="invalid">
                                                {errors[`value.${locale}`] ||
                                                    errors.value}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        {/* All languages reference */}
                                        <div className="mb-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {
                                                    translations.both_languages_reference
                                                }
                                            </small>

                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{
                                                    fontSize: "13px",
                                                }}
                                            >
                                                {languages.map(
                                                    (language: any) => (
                                                        <span
                                                            key={language.code}
                                                        >
                                                            <strong>
                                                                {language.code.toUpperCase()}
                                                                :
                                                            </strong>{" "}
                                                            {data.value?.[
                                                                language.code
                                                            ] || "—"}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.booklist",
                                                    {
                                                        rolePrefix: rolePrefix,
                                                    },
                                                )}
                                                className="btn btn-secondary me-2"
                                            >
                                                {translations.cancel}
                                            </Link>

                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? translations.saving
                                                    : isEdit
                                                      ? translations.update
                                                      : translations.save}
                                            </button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

BookForm.layout = (page: any) => <Layout children={page} />;

export default BookForm;
