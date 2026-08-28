import React from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";

interface Language {
    id: number;
    code: string;
    name: string;
}

interface Props {
    language?: Language | null;
}

const translations = {
    en: {
        pageTitleCreate: "Add Language",
        pageTitleEdit: "Edit Language",
        breadcrumbParent: "Languages",
        cardTitleCreate: "New Language",
        cardTitleEdit: "Language Details",
        codeLabel: "Code",
        codePlaceholder: "e.g. en, gu",
        nameLabel: "Name",
        namePlaceholder: "Enter language name",
        codeRequired: "Please enter language code",
        nameRequired: "Please enter language name",
        cancel: "Cancel",
        save: "Save",
        update: "Update",
        saving: "Saving...",
        createSuccess: "Language created successfully",
        updateSuccess: "Language updated successfully",
        fixErrors: "Please solve this issue.",
    },
    gu: {
        pageTitleCreate: "ભાષા ઉમેરો",
        pageTitleEdit: "ભાષા ફેરફાર કરો",
        breadcrumbParent: "ભાષાઓ",
        cardTitleCreate: "નવી ભાષા",
        cardTitleEdit: "ભાષા વિગતો",
        codeLabel: "કોડ",
        codePlaceholder: "ઉદા. en, gu",
        nameLabel: "નામ",
        namePlaceholder: "ભાષાનું નામ દાખલ કરો",
        codeRequired: "કૃપા કરીને ભાષા કોડ દાખલ કરો",
        nameRequired: "કૃપા કરીને ભાષાનું નામ દાખલ કરો",
        cancel: "રદ કરો",
        save: "સાચવો",
        update: "અપડેટ કરો",
        saving: "સાચવી રહ્યા છીએ...",
        createSuccess: "ભાષા સફળતાપૂર્વક બનાવી",
        updateSuccess: "ભાષા સફળતાપૂર્વક અપડેટ થઈ",
        fixErrors: "કૃપા કરીને ભૂલો સુધારો.",
    },
};

const LangForm: React.FC<Props> = ({ language = null }) => {
    const page = usePage().props as {
        locale?: string;
        errors?: Record<string, string>;
    };
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const tr = translations[locale];
    const isEdit = !!language?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        code: language?.code ?? "",
        name: language?.name ?? "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.languages.update", {
                    rolePrefix: rolePrefix,
                    language: language!.id,
                }),
                {
                    onSuccess: () => toast.success(tr.updateSuccess),
                    onError: () => toast.error(tr.fixErrors),
                },
            );
        } else {
            post(
                route("role.languages.store", {
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
                                                ID #{language!.id}
                                            </span>
                                        )}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            {/* Code */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="language-code">
                                                        {tr.codeLabel}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="language-code"
                                                        placeholder={
                                                            tr.codePlaceholder
                                                        }
                                                        value={data.code}
                                                        onChange={(e) =>
                                                            setData(
                                                                "code",
                                                                e.target.value
                                                                    .toLowerCase()
                                                                    .trim(),
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.code
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.code ||
                                                            tr.codeRequired}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>

                                            {/* Name */}
                                            <Col lg={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="language-name">
                                                        {tr.nameLabel}{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="language-name"
                                                        placeholder={
                                                            tr.namePlaceholder
                                                        }
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                "name",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.name
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.name ||
                                                            tr.nameRequired}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="text-end mt-4">
                                            <Link
                                                href={route(
                                                    "role.languages.list",
                                                    {
                                                        rolePrefix: rolePrefix,
                                                    },
                                                )}
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

LangForm.layout = (page: any) => <Layout children={page} />;
export default LangForm;
