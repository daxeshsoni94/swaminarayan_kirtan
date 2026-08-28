import React, { useEffect } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../../Layouts";
import { toast } from "react-toastify";

const NameForm = ({ names = null }) => {
    const page = usePage().props;

    const locale = page.locale === "gu" ? "gu" : "en";
    const isGu = locale === "gu";
    const isEdit = !!names?.id;
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const { data, setData, post, put, processing, errors } = useForm({
        value: {
            en: names?.value?.en ?? "",
            gu: names?.value?.gu ?? "",
        },
        locale,
    });

    // Keep form locale in sync with header toggle
    useEffect(() => {
        setData("locale", locale);
    }, [locale]);

    const setValue = (text) => {
        setData("value", {
            ...data.value,
            [locale]: text,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.names.update", {
                    rolePrefix: rolePrefix,
                    name: names.id,
                }),
                {
                    onSuccess: () =>
                        toast.success(
                            isGu
                                ? "નામ સફળતાપૂર્વક અપડેટ થઈ!"
                                : "Name updated successfully!",
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
                route("role.category.namestore", {
                    rolePrefix: rolePrefix,
                }),
                {
                    onSuccess: () =>
                        toast.success(
                            isGu
                                ? "નામ સફળતાપૂર્વક ઉમેરવામાં આવી!"
                                : "Name added successfully!",
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
                            ? "નામ સંપાદિત કરો"
                            : "Edit Name"
                        : isGu
                          ? "નામ ઉમેરો"
                          : "Add Name"
                }
            />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={
                            isEdit
                                ? isGu
                                    ? "નામ સંપાદિત કરો"
                                    : "Edit Event"
                                : isGu
                                  ? "નામ ઉમેરો"
                                  : "Add Name"
                        }
                        pageTitle={isGu ? "નામ" : "Name"}
                    />

                    {/* Locale indicator */}
                    <div className="mb-3">
                        <span className="badge bg-primary">
                            {isGu
                                ? "ફોર્મ: ગુજરાતી (GU)"
                                : "Form: English (EN)"}
                        </span>

                        <small className="text-muted ms-2">
                            {isGu
                                ? "બીજી ભાષામાં ફેરફાર કરવા માટે હેડર ટૉગલ બદલો."
                                : "Switch language from the header toggle to edit the other translation."}
                        </small>
                    </div>

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? isGu
                                                ? "નામ વિગતો"
                                                : "Name Details"
                                            : isGu
                                              ? "નવું નામ"
                                              : "New Name"}

                                        {isEdit && (
                                            <span
                                                className="badge bg-secondary ms-2"
                                                style={{
                                                    fontSize: "10px",
                                                }}
                                            >
                                                ID #{names.id}
                                            </span>
                                        )}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        {/* Type is fixed */}
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                {isGu ? "પ્રકાર" : "Type"}
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                value={isGu ? "નામ" : "Name"}
                                                disabled
                                                readOnly
                                            />

                                            <Form.Text className="text-muted">
                                                {isGu
                                                    ? "પ્રકાર હંમેશા નામ રહેશે."
                                                    : "Type is always set to name."}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* Place value - current locale */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="name-value">
                                                {isGu
                                                    ? "વિશેષણનું નામ"
                                                    : "Name Name"}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                id="name-value"
                                                placeholder={
                                                    isGu
                                                        ? "ઉદા. જાદુગર"
                                                        : "e.g. Jadugara"
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

                                            <Form.Text className="text-muted">
                                                {isGu
                                                    ? "બીજી ભાષા માટે હેડર ટૉગલ બદલો."
                                                    : "Switch the header toggle to fill the other language."}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* Both languages reference */}
                                        <div className="mb-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {isGu
                                                    ? "બંને ભાષાઓ (સંદર્ભ)"
                                                    : "Both languages (reference)"}
                                            </small>

                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{
                                                    fontSize: "13px",
                                                }}
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

                                        {/* Buttons */}
                                        <div className="text-end">
                                            <Link
                                                href={route(
                                                    "role.category.namelist",
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

NameForm.layout = (page) => <Layout children={page} />;

export default NameForm;
