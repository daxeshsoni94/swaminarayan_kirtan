import React, { useEffect } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";

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

const translations = {
    en: {
        pageTitleCreate: "Add Page",
        pageTitleEdit: "Edit Page",
        breadcrumbParent: "Pages",
        cardTitleCreate: "New Page",
        cardTitleEdit: "Page Details",
        groupLabel: "Page Group",
        groupPlaceholder: "e.g. legal, support, about",
        titleLabel: "Title",
        titlePlaceholder: "Enter page title",
        slugLabel: "Slug",
        slugPlaceholder: "e.g. terms-conditions",
        contentLabel: "Content",
        contentPlaceholder: "Enter page content (HTML allowed)",
        statusLabel: "Status",
        statusPublished: "Published",
        statusDraft: "Draft",
        cancel: "Cancel",
        save: "Save",
        update: "Update",
        saving: "Saving...",
        createSuccess: "Page created successfully",
        updateSuccess: "Page updated successfully",
        fixErrors: "Please fix the errors.",
        groupRequired: "Please enter page group",
        titleRequired: "Please enter title",
        slugRequired: "Please enter slug",
        contentRequired: "Please enter content",
        statusRequired: "Please select status",
    },
    gu: {
        pageTitleCreate: "પેજ ઉમેરો",
        pageTitleEdit: "પેજ ફેરફાર કરો",
        breadcrumbParent: "પેજ",
        cardTitleCreate: "નવું પેજ",
        cardTitleEdit: "પેજ વિગતો",
        groupLabel: "પેજ ગ્રુપ",
        groupPlaceholder: "ઉદા. legal, support, about",
        titleLabel: "ટાઇટલ",
        titlePlaceholder: "પેજનું ટાઇટલ દાખલ કરો",
        slugLabel: "સ્લગ",
        slugPlaceholder: "ઉદા. terms-conditions",
        contentLabel: "કન્ટેન્ટ",
        contentPlaceholder: "પેજ કન્ટેન્ટ દાખલ કરો (HTML ચાલે)",
        statusLabel: "સ્થિતિ",
        statusPublished: "પ્રકાશિત",
        statusDraft: "ડ્રાફ્ટ",
        cancel: "રદ કરો",
        save: "સાચવો",
        update: "અપડેટ કરો",
        saving: "સાચવી રહ્યા છીએ...",
        createSuccess: "પેજ સફળતાપૂર્વક બનાવ્યું",
        updateSuccess: "પેજ સફળતાપૂર્વક અપડેટ થયું",
        fixErrors: "કૃપા કરીને ભૂલો સુધારો.",
        groupRequired: "કૃપા કરીને પેજ ગ્રુપ દાખલ કરો",
        titleRequired: "કૃપા કરીને ટાઇટલ દાખલ કરો",
        slugRequired: "કૃપા કરીને સ્લગ દાખલ કરો",
        contentRequired: "કૃપા કરીને કન્ટેન્ટ દાખલ કરો",
        statusRequired: "કૃપા કરીને સ્થિતિ પસંદ કરો",
    },
};

const slugify = (text: string) =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

const PageForm: React.FC<Props> = ({ page = null }) => {
    const pageProps = usePage().props as {
        locale?: string;
        errors?: Record<string, string>;
    };
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const locale = (pageProps.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const tr = translations[locale];
    const isEdit = !!page?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        page_group: page?.page_group ?? "",
        title: page?.title ?? "",
        slug: page?.slug ?? "",
        content: page?.content ?? "",
        status: page?.status ?? "draft",
    });

    // Auto-generate slug from title (only on create, when slug is empty or matches old auto value)
    useEffect(() => {
        if (!isEdit && data.title) {
            setData("slug", slugify(data.title));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.title]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.pages.update", {
                    rolePrefix: rolePrefix,
                    page: page!.id,
                }),
                {
                    onSuccess: () => toast.success(tr.updateSuccess),
                    onError: () => toast.error(tr.fixErrors),
                },
            );
        } else {
            post(
                route("role.pages.store", {
                    rolePrefix: rolePrefix,
                }),
                {
                    onSuccess: () => toast.success(tr.createSuccess),
                    onError: () => toast.error(tr.fixErrors),
                },
            );
        }
    };

    return (
        <React.Fragment>
            <Head title={isEdit ? tr.pageTitleEdit : tr.pageTitleCreate} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={isEdit ? tr.pageTitleEdit : tr.pageTitleCreate}
                        pageTitle={tr.breadcrumbParent}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? tr.cardTitleEdit
                                            : tr.cardTitleCreate}
                                        {isEdit && (
                                            <span
                                                className="badge bg-secondary ms-2"
                                                style={{ fontSize: "10px" }}
                                            >
                                                ID #{page!.id}
                                            </span>
                                        )}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            {/* Page Group */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-group">
                                                        {tr.groupLabel}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="page-group"
                                                        placeholder={
                                                            tr.groupPlaceholder
                                                        }
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
                                                            tr.groupRequired}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Status */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-status">
                                                        {tr.statusLabel}{" "}
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
                                                            {tr.statusDraft}
                                                        </option>
                                                        <option value="published">
                                                            {tr.statusPublished}
                                                        </option>
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.status ||
                                                            tr.statusRequired}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Title */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-title">
                                                        {tr.titleLabel}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="page-title"
                                                        placeholder={
                                                            tr.titlePlaceholder
                                                        }
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
                                                            tr.titleRequired}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/*Slug */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-slug">
                                                        {tr.slugLabel}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="page-slug"
                                                        placeholder={
                                                            tr.slugPlaceholder
                                                        }
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
                                                            tr.slugRequired}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Content */}
                                            <Col lg={12}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="page-content">
                                                        {tr.contentLabel}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={12}
                                                        id="page-content"
                                                        placeholder={
                                                            tr.contentPlaceholder
                                                        }
                                                        value={data.content}
                                                        onChange={(e) =>
                                                            setData(
                                                                "content",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.content
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.content ||
                                                            tr.contentRequired}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="text-end mt-4">
                                            <Link
                                                href={route("role.pages.list", {
                                                    rolePrefix: rolePrefix,
                                                })}
                                                className="btn btn-secondary me-2"
                                            >
                                                {tr.cancel}
                                            </Link>
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? tr.saving
                                                    : isEdit
                                                      ? tr.update
                                                      : tr.save}
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

PageForm.layout = (page: any) => <Layout children={page} />;
export default PageForm;
