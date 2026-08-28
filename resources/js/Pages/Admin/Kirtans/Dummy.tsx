// resources/js/Pages/Admin/Kirtans/Create.jsx

import React, { useState, useMemo } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

// ── PadCategorySelector ──────────────────────────────────────────────────────
// Renders a SINGLE grouped react-select (all types as option-groups) +
// per-type "Add new value" inline inputs + "New Type" panel.
const PadCategorySelector = ({ padCategories = [], onChange, allCategories = [] }) => {

    // { [type]: [{ id, value }] }
    const grouped = useMemo(() => allCategories.reduce((acc, c) => {
        if (!acc[c.type]) acc[c.type] = [];
        acc[c.type].push({ id: c.id, value: c.value });
        return acc;
    }, {}), [allCategories]);

    const existingTypes = Object.keys(grouped);

    // Extra values added by user per type  { [type]: string[] }
    const [extraOptions,        setExtraOptions]        = useState({});
    // Extra types added by user (not in DB)
    const [extraTypes,          setExtraTypes]          = useState([]);
    // Per-type add-value input visibility
    const [showAddValue,        setShowAddValue]        = useState({});
    const [newValueInput,       setNewValueInput]       = useState({});
    // New-type input
    const [showNewType,         setShowNewType]         = useState(false);
    const [newTypeText,         setNewTypeText]         = useState("");

    // All types to show (DB + user-created)
    const allTypes = useMemo(() =>
        [...new Set([...existingTypes, ...extraTypes])],
        [existingTypes, extraTypes]
    );

    // Build grouped options for react-select
    const groupedOptions = useMemo(() => allTypes.map(type => ({
        label: type,
        options: [
            ...(grouped[type]      || []).map(ev => ({
                value: `${type}||${ev.value}`,
                label: ev.value,
                type,  val: ev.value, isCustomValue: false,
            })),
            ...(extraOptions[type] || []).map(v => ({
                value: `${type}||${v}`,
                label: v,
                type,  val: v, isCustomValue: true,
            })),
        ],
    })).filter(g => g.options.length > 0), [allTypes, grouped, extraOptions]);

    // Currently selected options
    const selectedOptions = useMemo(() => padCategories.map(c => ({
        value:         `${c.type}||${c.value}`,
        label:         c.value,
        type:          c.type,
        val:           c.value,
        isCustomValue: c.isCustomValue,
    })), [padCategories]);

    const handleSelectChange = (selected) => {
        onChange((selected || []).map(opt => ({
            type:          opt.type,
            value:         opt.val,
            isCustomValue: opt.isCustomValue,
        })));
    };

    const handleAddCustomValue = (type) => {
        const val = (newValueInput[type] || "").trim();
        if (!val) return;
        setExtraOptions(prev => ({ ...prev, [type]: [...(prev[type] || []), val] }));
        if (!padCategories.some(c => c.type === type && c.value === val)) {
            onChange([...padCategories, { type, value: val, isCustomValue: true }]);
        }
        setNewValueInput(prev => ({ ...prev, [type]: "" }));
        setShowAddValue(prev => ({ ...prev, [type]: false }));
    };

    const handleAddNewType = () => {
        const t = newTypeText.trim();
        if (!t || allTypes.includes(t)) return;
        setExtraTypes(prev => [...prev, t]);
        // seed empty so it appears even before values are added
        setExtraOptions(prev => ({ ...prev, [t]: [] }));
        setShowAddValue(prev => ({ ...prev, [t]: true })); // open its input immediately
        setNewTypeText("");
        setShowNewType(false);
    };

    const dbValues = (type) => (grouped[type] || []).map(ev => ev.value);

    return (
        <div>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-2">
                <Form.Label className="mb-0 fw-semibold" style={{ fontSize: "13px" }}>
                    Categories
                </Form.Label>
                {padCategories.length > 0 && (
                    <span className="badge bg-success" style={{ fontSize: "10px" }}>
                        {padCategories.length} selected
                    </span>
                )}
            </div>

            {/* ── Single grouped react-select ── */}
            <Select
                isMulti
                closeMenuOnSelect={false}
                components={animatedComponents}
                options={groupedOptions}
                value={selectedOptions}
                onChange={handleSelectChange}
                placeholder="Select categories…"
                noOptionsMessage={() => "No values — add a type below"}
                formatGroupLabel={(group) => (
                    <div className="d-flex align-items-center justify-content-between py-1">
                        <span className="fw-semibold text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                            {group.label}
                        </span>
                        <span className="badge bg-secondary" style={{ fontSize: "10px" }}>
                            {group.options.length}
                        </span>
                    </div>
                )}
                styles={{
                    control:        (b) => ({ ...b, fontSize: "13px", minHeight: "36px" }),
                    menu:           (b) => ({ ...b, fontSize: "13px", zIndex: 9999 }),
                    groupHeading:   (b) => ({ ...b, background: "#f0f4ff", padding: "4px 8px", margin: 0 }),
                    multiValue:     (b) => ({ ...b, background: "#e7f3ff" }),
                    multiValueLabel:(b) => ({ ...b, color: "#0d6efd" }),
                }}
            />

            {/* ── Per-type "Add new value" links ── */}
            {allTypes.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                    {allTypes.map(type => {
                        const isAdding = showAddValue[type] || false;
                        return (
                            <div key={type}>
                                {!isAdding ? (
                                    <button
                                        type="button"
                                        className="btn btn-link btn-sm p-0 text-success"
                                        style={{ fontSize: "11px" }}
                                        onClick={() => setShowAddValue(prev => ({ ...prev, [type]: true }))}
                                    >
                                        <i className="bx bx-plus"></i> {type}
                                    </button>
                                ) : (
                                    <div className="d-flex gap-1 align-items-center border rounded px-2 py-1" style={{ background: "#f8f9fa" }}>
                                        <span className="badge bg-primary me-1" style={{ fontSize: "10px" }}>{type}</span>
                                        <Form.Control
                                            type="text"
                                            size="sm"
                                            autoFocus
                                            placeholder={`New ${type} value…`}
                                            value={newValueInput[type] || ""}
                                            style={{ width: "140px", fontSize: "12px" }}
                                            onChange={e => setNewValueInput(prev => ({ ...prev, [type]: e.target.value }))}
                                            onKeyDown={e => {
                                                if (e.key === "Enter")  { e.preventDefault(); handleAddCustomValue(type); }
                                                if (e.key === "Escape") {
                                                    setShowAddValue(prev => ({ ...prev, [type]: false }));
                                                    setNewValueInput(prev => ({ ...prev, [type]: "" }));
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm py-0 px-2"
                                            style={{ fontSize: "12px" }}
                                            disabled={!(newValueInput[type] || "").trim()}
                                            onClick={() => handleAddCustomValue(type)}
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm py-0 px-1"
                                            onClick={() => {
                                                setShowAddValue(prev => ({ ...prev, [type]: false }));
                                                setNewValueInput(prev => ({ ...prev, [type]: "" }));
                                            }}
                                        >
                                            <i className="bx bx-x"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── New Type ── */}
            <div className="mt-2">
                {!showNewType ? (
                    <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-warning"
                        style={{ fontSize: "11px" }}
                        onClick={() => setShowNewType(true)}
                    >
                        <i className="bx bx-plus me-1"></i>Add new category type
                    </button>
                ) : (
                    <div className="d-flex gap-1 align-items-center">
                        <Form.Control
                            type="text"
                            size="sm"
                            autoFocus
                            placeholder="New type name…"
                            value={newTypeText}
                            style={{ width: "160px", fontSize: "12px" }}
                            onChange={e => setNewTypeText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter")  { e.preventDefault(); handleAddNewType(); }
                                if (e.key === "Escape") { setShowNewType(false); setNewTypeText(""); }
                            }}
                        />
                        <button
                            type="button"
                            className="btn btn-warning btn-sm"
                            disabled={!newTypeText.trim()}
                            onClick={handleAddNewType}
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => { setShowNewType(false); setNewTypeText(""); }}
                        >
                            <i className="bx bx-x"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Create ──────────────────────────────────────────────────────────────
const Create = ({ categories }) => {

    const { data, setData, post, processing, errors, reset } = useForm({
        title:  "",
        status: "draft",
        pads:   [],
    });

    const addPad = () => setData("pads", [
        ...data.pads,
        { title: "", value: "", status: "draft", establish_date: "", categories: [] },
    ]);

    const removePad = (index) => {
        const updated = [...data.pads];
        updated.splice(index, 1);
        setData("pads", updated);
    };

    const updatePad = (index, field, value) => {
        const updated = [...data.pads];
        updated[index][field] = value;
        setData("pads", updated);
    };

    const handleSubmit = (submitStatus) => {
        setData("status", submitStatus);
        setTimeout(() => {
            post(route("admin.kirtans.store"), {
                onSuccess: () => { toast.success("Kirtan created successfully!"); reset(); },
                onError:   () => { toast.error("Please fix the errors below."); },
            });
        }, 50);
    };

    const totalCategories = data.pads.reduce((sum, p) => sum + (p.categories?.length ?? 0), 0);

    return (
        <React.Fragment>
            <Head title="Add Kirtan" />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Add Kirtan" pageTitle="Kirtans" />
                    <Row>
                        <Col lg={12}>

                            {/* ── Kirtan Details + Draft checkbox (same header row) ── */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">Kirtan Details</h5>

                                    {/* Kirtan draft checkbox — opposite side of the header */}
                                    <div className="form-check mb-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="kirtan-draft"
                                            checked={data.status === "draft"}
                                            onChange={(e) =>
                                                setData("status", e.target.checked ? "draft" : "save")
                                            }
                                        />
                                        <label className="form-check-label" htmlFor="kirtan-draft" style={{ fontSize: "13px" }}>
                                            Save as Draft&nbsp;
                                            <span className={`badge ${data.status === "draft" ? "bg-warning" : "bg-success"}`}>
                                                {data.status === "draft" ? "Draft" : "Published"}
                                            </span>
                                        </label>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group>
                                        <Form.Label htmlFor="kirtan-title">
                                            Kirtan Title <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="kirtan-title"
                                            placeholder="Enter kirtan title"
                                            value={data.title}
                                            onChange={(e) => setData("title", e.target.value)}
                                            isInvalid={!!errors.title}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.title}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            {/* ── Pads ── */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        Pads <span className="badge bg-info ms-1">{data.pads.length}</span>
                                    </h5>
                                    <button type="button" className="btn btn-success btn-sm" onClick={addPad}>
                                        <i className="bx bx-plus me-1"></i>Add Pad
                                    </button>
                                </Card.Header>
                                <Card.Body>

                                    {data.pads.length === 0 && (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bx bx-music display-5 d-block mb-2"></i>
                                            <p className="mb-3">No pads added yet. Add pads now or after saving.</p>
                                            <button type="button" className="btn btn-outline-success btn-sm" onClick={addPad}>
                                                + Add First Pad
                                            </button>
                                        </div>
                                    )}

                                    {data.pads.map((pad, index) => (
                                        <div
                                            key={index}
                                            className="border rounded p-3 mb-3"
                                            style={{ background: "var(--vz-light)" }}
                                        >
                                            {/* Pad header: title | draft checkbox | remove button */}
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0 text-primary fw-semibold">
                                                    <i className="bx bx-music me-1"></i>Pad {index + 1}
                                                </h6>

                                                <div className="d-flex align-items-center gap-3">
                                                    {/* ── Pad draft checkbox ── */}
                                                    <div className="form-check mb-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`pad-draft-${index}`}
                                                            checked={pad.status === "draft"}
                                                            onChange={(e) =>
                                                                updatePad(index, "status", e.target.checked ? "draft" : "save")
                                                            }
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`pad-draft-${index}`}
                                                            style={{ fontSize: "13px" }}
                                                        >
                                                            Draft&nbsp;
                                                            <span className={`badge ${pad.status === "draft" ? "bg-warning" : "bg-success"}`}>
                                                                {pad.status === "draft" ? "Draft" : "Published"}
                                                            </span>
                                                        </label>
                                                    </div>

                                                    {/* Remove button */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => removePad(index)}
                                                    >
                                                        <i className="bx bx-trash me-1"></i>Remove
                                                    </button>
                                                </div>
                                            </div>

                                            <Row>
                                                {/* Pad Title */}
                                                <Col lg={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>
                                                            Pad Title <span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={`Enter pad ${index + 1} title`}
                                                            value={pad.title}
                                                            onChange={(e) => updatePad(index, "title", e.target.value)}
                                                            isInvalid={!!errors[`pads.${index}.title`]}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors[`pads.${index}.title`]}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                {/* Lyrics */}
                                                <Col lg={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>
                                                            Lyrics (Value) <span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={4}
                                                            placeholder="Enter lyrics..."
                                                            value={pad.value}
                                                            onChange={(e) => updatePad(index, "value", e.target.value)}
                                                            isInvalid={!!errors[`pads.${index}.value`]}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors[`pads.${index}.value`]}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                {/* Establish Date */}
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Establish Date</Form.Label>
                                                        <Flatpickr
                                                            className="form-control"
                                                            placeholder="Select date"
                                                            options={{ dateFormat: "Y-m-d" }}
                                                            onChange={([date]) =>
                                                                updatePad(index, "establish_date",
                                                                    date ? date.toISOString().split("T")[0] : "")
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* ── Categories ── */}
                                                <Col lg={12}>
                                                    <div className="p-3 rounded border" style={{ background: "#fff" }}>
                                                        <PadCategorySelector
                                                            padCategories={pad.categories ?? []}
                                                            allCategories={categories ?? []}
                                                            onChange={(cats) => updatePad(index, "categories", cats)}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}

                                    {data.pads.length > 0 && (
                                        <button type="button" className="btn btn-outline-success btn-sm w-100" onClick={addPad}>
                                            <i className="bx bx-plus me-1"></i>Add Another Pad
                                        </button>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Action Buttons */}
                            <div className="text-end mb-4">
                                <Link href="#" className="btn btn-secondary w-sm me-1">Cancel</Link>
                                <button
                                    type="button"
                                    className="btn btn-warning w-sm me-1"
                                    disabled={processing}
                                    onClick={() => handleSubmit("draft")}
                                >
                                    Save as Draft
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success w-sm"
                                    disabled={processing}
                                    onClick={() => handleSubmit("save")}
                                >
                                    {processing ? "Saving..." : "Save Kirtan"}
                                </button>
                            </div>

                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

Create.layout = (page) => <Layout children={page} />;
export default Create;