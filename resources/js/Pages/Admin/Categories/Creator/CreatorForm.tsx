// resources/js/Pages/Admin/Categories/Creator/CreatorForm.jsx

import React, { useEffect } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../../Layouts";
import { toast } from "react-toastify";

type Trans = { en: string; gu: string };

interface CreatorFormProps {
    creator?: {
        id: number;
        value: Trans;
    } | null;
}

const CreatorForm = ({ creator = null }: CreatorFormProps) => {
    const page = usePage().props as {
        locale?: string;
        errors?: Record<string, string>;
    };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const isGu = locale === "gu";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const isEdit = !!creator?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        value: {
            en: creator?.value?.en ?? "",
            gu: creator?.value?.gu ?? "",
        } as Trans,
        locale,
    });

    // Keep form locale in sync with header toggle
    useEffect(() => {
        setData("locale", locale);
    }, [locale]);

    const setValue = (text: string) => {
        setData("value", {
            ...data.value,
            [locale]: text,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.creators.update", {
                    rolePrefix: rolePrefix,
                    category: creator!.id,
                }),
                {
                    onSuccess: () =>
                        toast.success(
                            isGu ? "રચયિતા અપડેટ થયું!" : "Creator updated!",
                        ),
                    onError: () =>
                        toast.error(
                            isGu
                                ? "કૃપા કરીને ભૂલો સુધારો."
                                : "Please fix the errors.",
                        ),
                },
            );
        } else {
            post(
                route("role.creators.store", {
                    rolePrefix: rolePrefix,
                }),
                {
                    onSuccess: () =>
                        toast.success(
                            isGu
                                ? "રચયિતા સફળતાપૂર્વક ઉમેરાયું!"
                                : "Creator added successfully!",
                        ),
                    onError: () =>
                        toast.error(
                            isGu
                                ? "કૃપા કરીને ભૂલો સુધારો."
                                : "Please fix the errors.",
                        ),
                },
            );
        }
    };

    return (
        <React.Fragment>
            <Head
                title={
                    isEdit
                        ? isGu
                            ? "રચયિતા સંપાદિત કરો"
                            : "Edit Creator"
                        : isGu
                          ? "રચયિતા ઉમેરો"
                          : "Add Creator"
                }
            />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={
                            isEdit
                                ? isGu
                                    ? "રચયિતા સંપાદિત કરો"
                                    : "Edit Creator"
                                : isGu
                                  ? "રચયિતા ઉમેરો"
                                  : "Add Creator"
                        }
                        pageTitle={isGu ? "રચયિતા" : "Creators"}
                    />

                    {/* <div className="mb-3">
                        <span className="badge bg-primary">
                            {isGu
                                ? "ફોર્મ: ગુજરાતી (GU)"
                                : "Form: English (EN)"}
                        </span>
                        <small className="text-muted ms-2">
                            Switch language from the header toggle to edit the
                            other translation.
                        </small>
                    </div> */}

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? isGu
                                                ? "રચયિતા વિગતો"
                                                : "Creator Details"
                                            : isGu
                                              ? "નવો ક્રિએટર"
                                              : "New Creator"}
                                        {/* {isEdit && (
                                            <span
                                                className="badge bg-secondary ms-2"
                                                style={{ fontSize: "10px" }}
                                            >
                                                ID #{creator!.id}
                                            </span>
                                        )} */}
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        {/* Type is fixed – display only */}
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                {isGu ? "પ્રકાર" : "Type"}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={
                                                    isGu ? "રચયિતા" : "Creator"
                                                }
                                                disabled
                                                readOnly
                                            />
                                            <Form.Text className="text-muted">
                                                {isGu
                                                    ? "પ્રકાર હંમેશા રચયિતા રહેશે."
                                                    : "Type is always set to Creator."}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* Value – current locale */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="creator-value">
                                                {isGu
                                                    ? "રચયિતાનું નામ"
                                                    : "Creator Name"}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="creator-value"
                                                placeholder={
                                                    isGu
                                                        ? "ઉદા. બ્રહ્માનંદ સ્વામી"
                                                        : "e.g. Bramhanand swami"
                                                }
                                                value={data.value[locale] ?? ""}
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
                                            {/* <Form.Text className="text-muted">
                                                {isGu
                                                    ? "બીજી ભાષા માટે હેડર ટૉગલ બદલો."
                                                    : "Switch header toggle to fill the other language."}
                                            </Form.Text> */}
                                        </Form.Group>

                                        {/* Optional: show both languages for reference */}
                                        <div className="mb-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {isGu
                                                    ? "બંને ભાષાઓ (સંદર્ભ)"
                                                    : "Both languages (reference)"}
                                            </small>
                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{ fontSize: "13px" }}
                                            >
                                                <span>
                                                    <strong>EN:</strong>{" "}
                                                    {data.value.en || "—"}
                                                </span>
                                                <span>
                                                    <strong>GU:</strong>{" "}
                                                    {data.value.gu || "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.creatorlist",
                                                    {
                                                        rolePrefix: rolePrefix,
                                                    },
                                                )}
                                                className="btn btn-secondary me-2"
                                            >
                                                {isGu ? "રદ કરો" : "Cancel"}
                                            </Link>
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? isGu
                                                        ? "સાચવી રહ્યા છીએ..."
                                                        : "Saving..."
                                                    : isEdit
                                                      ? isGu
                                                          ? "અપડેટ કરો"
                                                          : "Update"
                                                      : isGu
                                                        ? "સાચવો"
                                                        : "Save"}
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

CreatorForm.layout = (page: any) => <Layout children={page} />;
export default CreatorForm;
