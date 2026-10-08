import React, { useEffect, useMemo } from "react";

import { Card, Col, Container, Form, Row } from "react-bootstrap";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import { Head, Link, useForm, usePage } from "@inertiajs/react";

import Layout from "../../../Layouts";

import JoditEditor from "jodit-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PageItem {
    id: number;
    page_group: string;
    title: string;
    slug: string;
    content: string;
    status: "published" | "draft";
}

interface Props {
    page?: PageItem | null;
}

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

// ─────────────────────────────────────────────────────────────────────────────
// Central Translator
// ─────────────────────────────────────────────────────────────────────────────

const createTranslator = (
    translations: Record<string, any>,
): TranslationFunction => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ): string => {
        let text = translations[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(new RegExp(`:${name}`, "g"), String(value));
        });

        return text;
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Slug Generator
// ─────────────────────────────────────────────────────────────────────────────

const slugify = (text: string): string =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

// ─────────────────────────────────────────────────────────────────────────────
// Page Form
// ─────────────────────────────────────────────────────────────────────────────

const PageForm: React.FC<Props> = ({ page = null }) => {
    const pageProps = usePage().props as any;

    const { auth, translations = {}, locale } = pageProps;

    // Current application locale
    const currentLocale = locale || "gu";

    // Central translator
    const tr = useMemo(() => createTranslator(translations), [translations]);

    // Dynamic role prefix
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const isEdit = !!page?.id;

    // ─────────────────────────────────────────────────────────────────────────
    // Form
    // ─────────────────────────────────────────────────────────────────────────

    const { data, setData, post, put, processing, errors } = useForm({
        page_group: page?.page_group ?? "",
        title: page?.title ?? "",
        slug: page?.slug ?? "",
        content: page?.content ?? "",
        status: page?.status ?? "draft",
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Auto Generate Slug
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!isEdit && data.title) {
            setData("slug", slugify(data.title));
        }
    }, [data.title, isEdit, setData]);

    // ─────────────────────────────────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.pages.update", {
                    rolePrefix,
                    page: page!.id,
                }),
                {
                    preserveScroll: true,
                },
            );
        } else {
            post(
                route("role.pages.store", {
                    rolePrefix,
                }),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <React.Fragment>
            <Head
                title={isEdit ? tr("page_title_edit") : tr("page_title_create")}
            />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={
                            isEdit
                                ? tr("page_title_edit")
                                : tr("page_title_create")
                        }
                        pageTitle={tr("pages")}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                {/* Card Header */}
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? tr("card_title_edit")
                                            : tr("card_title_create")}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            {/* Page Group */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-group">
                                                        {tr("page_group")}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>

                                                    <Form.Control
                                                        type="text"
                                                        id="page-group"
                                                        placeholder={tr(
                                                            "page_group_placeholder",
                                                        )}
                                                        value={data.page_group}
                                                        onChange={(e) =>
                                                            setData(
                                                                "page_group",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.page_group
                                                        }
                                                    />

                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.page_group ||
                                                            tr(
                                                                "page_group_required",
                                                            )}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Status */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-status">
                                                        {tr("status")}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>

                                                    <Form.Select
                                                        id="page-status"
                                                        value={data.status}
                                                        onChange={(e) =>
                                                            setData(
                                                                "status",
                                                                e.target
                                                                    .value as
                                                                    | "published"
                                                                    | "draft",
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.status
                                                        }
                                                    >
                                                        <option value="draft">
                                                            {tr("draft")}
                                                        </option>

                                                        <option value="published">
                                                            {tr("published")}
                                                        </option>
                                                    </Form.Select>

                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.status ||
                                                            tr(
                                                                "status_required",
                                                            )}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Title */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-title">
                                                        {tr("title")}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>

                                                    <Form.Control
                                                        type="text"
                                                        id="page-title"
                                                        placeholder={tr(
                                                            "title_placeholder",
                                                        )}
                                                        value={data.title}
                                                        onChange={(e) =>
                                                            setData(
                                                                "title",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.title
                                                        }
                                                    />

                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.title ||
                                                            tr(
                                                                "title_required",
                                                            )}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Slug */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-slug">
                                                        {tr("slug")}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>

                                                    <Form.Control
                                                        type="text"
                                                        id="page-slug"
                                                        placeholder={tr(
                                                            "slug_placeholder",
                                                        )}
                                                        value={data.slug}
                                                        onChange={(e) =>
                                                            setData(
                                                                "slug",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.slug
                                                        }
                                                    />

                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.slug ||
                                                            tr("slug_required")}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Content */}
                                            <Col lg={12}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-content">
                                                        {tr("content")}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>

                                                    <div
                                                        className={
                                                            errors.content
                                                                ? "is-invalid"
                                                                : ""
                                                        }
                                                    >
                                                        <JoditEditor
                                                            value={data.content}
                                                            onBlur={(
                                                                newContent,
                                                            ) =>
                                                                setData(
                                                                    "content",
                                                                    newContent,
                                                                )
                                                            }
                                                            config={{
                                                                readonly: false,
                                                                placeholder: tr(
                                                                    "content_placeholder",
                                                                ),
                                                                height: 350,
                                                            }}
                                                        />
                                                    </div>

                                                    {errors.content && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors.content ||
                                                                tr(
                                                                    "content_required",
                                                                )}
                                                        </div>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Buttons */}
                                        <div className="text-end mt-4">
                                            <Link
                                                href={route("role.pages.list", {
                                                    rolePrefix,
                                                })}
                                                className="btn btn-secondary me-2"
                                            >
                                                {tr("cancel")}
                                            </Link>

                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? tr("saving")
                                                    : isEdit
                                                      ? tr("update")
                                                      : tr("save")}
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

PageForm.layout = (page: any) => <Layout>{page}</Layout>;

export default PageForm;
