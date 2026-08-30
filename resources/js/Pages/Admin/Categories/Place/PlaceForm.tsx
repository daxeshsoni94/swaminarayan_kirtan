import React, { useEffect } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../../Layouts";
import { toast } from "react-toastify";

const PlaceForm = ({ place = null }) => {
    const page = usePage().props;

    const locale = page.locale === "gu" ? "gu" : "en";
    const isGu = locale === "gu";
    const isEdit = !!place?.id;
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const { data, setData, post, put, processing, errors } = useForm({
        value: {
            en: place?.value?.en ?? "",
            gu: place?.value?.gu ?? "",
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
                route("role.place.update", {
                    rolePrefix: rolePrefix,
                    place: place.id,
                }),
                {
                    onSuccess: () =>
                        toast.success(
                            isGu
                                ? "સ્થળ સફળતાપૂર્વક અપડેટ થઈ!"
                                : "Place updated successfully!",
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
                route("role.category.placestore", {
                    rolePrefix: rolePrefix,
                }),
                {
                    onSuccess: () =>
                        toast.success(
                            isGu
                                ? "સ્થળ સફળતાપૂર્વક ઉમેરવામાં આવી!"
                                : "Place added successfully!",
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
                            ? "સ્થળ સંપાદિત કરો"
                            : "Edit Place"
                        : isGu
                          ? "સ્થળ ઉમેરો"
                          : "Add Place"
                }
            />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={
                            isEdit
                                ? isGu
                                    ? "સ્થળ સંપાદિત કરો"
                                    : "Edit Place"
                                : isGu
                                  ? "સ્થળ ઉમેરો"
                                  : "Add Place"
                        }
                        pageTitle={isGu ? "સ્થળ" : "Places"}
                    />

                    {/* Locale indicator */}
                    {/* <div className="mb-3">
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
                    </div> */}

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? isGu
                                                ? "સ્થળ વિગતો"
                                                : "Place Details"
                                            : isGu
                                              ? "નવું સ્થળ"
                                              : "New Place"}

                                        {/* {isEdit && (
                                            <span
                                                className="badge bg-secondary ms-2"
                                                style={{
                                                    fontSize: "10px",
                                                }}
                                            >
                                                ID #{place.id}
                                            </span>
                                        )} */}
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
                                                value={isGu ? "સ્થળ" : "Place"}
                                                disabled
                                                readOnly
                                            />

                                            <Form.Text className="text-muted">
                                                {isGu
                                                    ? "પ્રકાર હંમેશા સ્થળ રહેશે."
                                                    : "Type is always set to Place."}
                                            </Form.Text>
                                        </Form.Group>

                                        {/* Place value - current locale */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="place-value">
                                                {isGu
                                                    ? "સ્થળનું નામ"
                                                    : "Place Name"}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                id="place-value"
                                                placeholder={
                                                    isGu
                                                        ? "ઉદા. ગઢડા"
                                                        : "e.g. Gadhada"
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
                                                    "role.category.placelist",
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

PlaceForm.layout = (page) => <Layout children={page} />;

export default PlaceForm;
