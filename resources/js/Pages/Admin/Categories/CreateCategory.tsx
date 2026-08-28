// resources/js/Pages/Admin/Categories/Create.jsx

import React, { useState } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";

// Fixed types from your app
const FIXED_TYPES = [
    "Event",
    "Place",
    "Adjective",
    "Name",
    "Book",
    "Bhav",
];

const CategoryCreate = ({ existingTypes }) => {

    const [customType, setCustomType] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        type:   "",
        values: [""],   // ✅ Array — multiple values for one type
    });

    // ── Value helpers ────────────────────────────────
    const addValue = () => {
        setData("values", [...data.values, ""]);
    };

    const removeValue = (index) => {
        const updated = [...data.values];
        updated.splice(index, 1);
        setData("values", updated);
    };

    const updateValue = (index, val) => {
        const updated = [...data.values];
        updated[index] = val;
        setData("values", updated);
    };

    // ── Submit ───────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.categories.store"), {
            onSuccess: () => {
                toast.success("Categories saved successfully!");
                reset();
                setCustomType(false);
            },
            onError: () => {
                toast.error("Please fix the errors below.");
            },
        });
    };

    const filledValues = data.values.filter(v => v.trim() !== "").length;

    return (
        <React.Fragment>
            <Head title="Add Category" />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Add Category" pageTitle="Categories" />

                    <Row>
                        <Col lg={8}>

                            {/* ── Type Selection Card ── */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        Category Type
                                    </h5>
                                </Card.Header>
                                <Card.Body>

                                    {/* Quick type selector pills */}
                                    <div className="mb-3">
                                        <Form.Label>
                                            Select Type{" "}
                                            <span className="text-danger">*</span>
                                        </Form.Label>
                                        <div className="d-flex flex-wrap gap-2 mb-2">
                                            {FIXED_TYPES.map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    className={`btn btn-sm ${
                                                        data.type === t && !customType
                                                            ? "btn-primary"
                                                            : "btn-outline-secondary"
                                                    }`}
                                                    onClick={() => {
                                                        setData("type", t);
                                                        setCustomType(false);
                                                    }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                className={`btn btn-sm ${
                                                    customType
                                                        ? "btn-warning"
                                                        : "btn-outline-warning"
                                                }`}
                                                onClick={() => {
                                                    setCustomType(true);
                                                    setData("type", "");
                                                }}
                                            >
                                                + Custom Type
                                            </button>
                                        </div>

                                        {/* Custom type input */}
                                        {customType && (
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter custom type name..."
                                                value={data.type}
                                                onChange={e => setData("type", e.target.value)}
                                                isInvalid={!!errors.type}
                                                className="mt-2"
                                                autoFocus
                                            />
                                        )}

                                        {errors.type && (
                                            <div className="text-danger mt-1" style={{fontSize:'12px'}}>
                                                {errors.type}
                                            </div>
                                        )}

                                        {/* Show selected type */}
                                        {data.type && (
                                            <div className="mt-2">
                                                <span className="text-muted" style={{fontSize:'12px'}}>
                                                    Selected:
                                                </span>{" "}
                                                <span className="badge bg-primary">
                                                    {data.type}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* ── Values Card ── */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        Category Values{" "}
                                        <span className="badge bg-info ms-1">
                                            {filledValues}
                                        </span>
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        onClick={addValue}
                                        disabled={!data.type}
                                    >
                                        <i className="bx bx-plus me-1"></i>
                                        Add Value
                                    </button>
                                </Card.Header>
                                <Card.Body>

                                    {!data.type && (
                                        <div className="text-center py-3 text-muted">
                                            <i className="bx bx-info-circle me-1"></i>
                                            Select a type first, then add values.
                                        </div>
                                    )}

                                    {data.type && (
                                        <>
                                            {/* Example hint */}
                                            <div className="alert alert-info py-2 mb-3" style={{fontSize:'12px'}}>
                                                <i className="bx bx-bulb me-1"></i>
                                                <strong>Example:</strong> Type = <strong>{data.type}</strong> →
                                                Values could be multiple entries like{" "}
                                                {data.type === "Event"
                                                    ? "Diwali, Holi, Janmashtami"
                                                    : data.type === "Place"
                                                    ? "Junagadh, Bhuj, Gomti"
                                                    : data.type === "Creator"
                                                    ? "Nishkulananda Swami, Muktanand Swami"
                                                    : "Value 1, Value 2, Value 3"
                                                }
                                            </div>

                                            {/* Value inputs */}
                                            {data.values.map((val, index) => (
                                                <div
                                                    key={index}
                                                    className="d-flex align-items-center gap-2 mb-2"
                                                >
                                                    <span
                                                        className="badge bg-light text-dark"
                                                        style={{minWidth:'28px'}}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder={`Enter ${data.type} value...`}
                                                        value={val}
                                                        onChange={e => updateValue(index, e.target.value)}
                                                        isInvalid={!!errors[`values.${index}`]}
                                                    />
                                                    {data.values.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => removeValue(index)}
                                                        >
                                                            <i className="bx bx-x"></i>
                                                        </button>
                                                    )}
                                                    {errors[`values.${index}`] && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors[`values.${index}`]}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Add more */}
                                            <button
                                                type="button"
                                                className="btn btn-outline-success btn-sm w-100 mt-2"
                                                onClick={addValue}
                                            >
                                                <i className="bx bx-plus me-1"></i>
                                                Add Another Value
                                            </button>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* ── Action Buttons ── */}
                            <div className="text-end mb-4">
                                <Link
                                    // href={route("admin.categories.index")}
                                    href="#"
                                    className="btn btn-secondary w-sm me-1"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="button"
                                    className="btn btn-success w-sm"
                                    disabled={processing || !data.type || filledValues === 0}
                                    onClick={handleSubmit}
                                >
                                    {processing
                                        ? "Saving..."
                                        : `Save ${filledValues} ${filledValues === 1 ? "Category" : "Categories"}`
                                    }
                                </button>
                            </div>

                        </Col>

                        {/* ── Right Sidebar ── */}
                        <Col lg={4}>

                            {/* Live Preview */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        Live Preview
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {!data.type ? (
                                        <p className="text-muted mb-0" style={{fontSize:'13px'}}>
                                            Select a type to see preview.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="mb-2">
                                                <small className="text-muted">Type</small>
                                                <div>
                                                    <span className="badge bg-primary">
                                                        {data.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <small className="text-muted">
                                                    Values ({filledValues})
                                                </small>
                                                <div className="d-flex flex-wrap gap-1 mt-1">
                                                    {data.values
                                                        .filter(v => v.trim())
                                                        .map((v, i) => (
                                                            <span
                                                                key={i}
                                                                className="badge bg-soft-success text-success border border-success"
                                                            >
                                                                {v}
                                                            </span>
                                                        ))
                                                    }
                                                    {filledValues === 0 && (
                                                        <span className="text-muted" style={{fontSize:'12px'}}>
                                                            No values entered yet
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* DB rows preview */}
                                            {filledValues > 0 && (
                                                <div className="mt-3 p-2 rounded" style={{background:'var(--vz-light)', fontSize:'11px'}}>
                                                    <div className="text-muted mb-1 fw-semibold">
                                                        Will create {filledValues} DB rows:
                                                    </div>
                                                    {data.values
                                                        .filter(v => v.trim())
                                                        .map((v, i) => (
                                                            <div key={i} className="d-flex gap-2">
                                                                <span className="text-primary">type:</span>
                                                                <span>{data.type}</span>
                                                                <span className="text-success">value:</span>
                                                                <span>{v}</span>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Info card */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">Information</h5>
                                </Card.Header>
                                <Card.Body>
                                    <ul className="list-unstyled mb-0 text-muted" style={{fontSize:'13px'}}>
                                        <li className="mb-2">
                                            <i className="bx bx-info-circle me-1"></i>
                                            Each value is stored as a separate row.
                                        </li>
                                        <li className="mb-2">
                                            <i className="bx bx-info-circle me-1"></i>
                                            <strong>Event</strong> → Diwali, Holi
                                        </li>
                                        <li className="mb-2">
                                            <i className="bx bx-info-circle me-1"></i>
                                            <strong>Place</strong> → Junagadh, Bhuj
                                        </li>
                                        <li>
                                            <i className="bx bx-info-circle me-1"></i>
                                            Used in pad categories selection.
                                        </li>
                                    </ul>
                                </Card.Body>
                            </Card>

                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

CategoryCreate.layout = (page) => <Layout children={page} />;
export default CategoryCreate;