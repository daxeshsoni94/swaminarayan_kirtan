// resources/js/Pages/Admin/Kirtans/Edit.jsx

import React, { useState, useMemo } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, router, useForm } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

// ── PadCategorySelector (identical to Create) ────────────────────────────────
const PadCategorySelector = ({
    padIndex,
    padCategories = [],
    onChange,
    allCategories = [],
}) => {
    const grouped = useMemo(() => {
        return allCategories.reduce((acc, c) => {
            if (!acc[c.type]) acc[c.type] = [];
            acc[c.type].push({ id: c.id, value: c.value });
            return acc;
        }, {});
    }, [allCategories]);

    const existingTypes = Object.keys(grouped);
    const [openTypes, setOpenTypes] = useState(() => [
        ...new Set(padCategories.map((c) => c.type)),
    ]);
    const [showAddValue, setShowAddValue] = useState({});
    const [newValueInput, setNewValueInput] = useState({});
    const [extraOptions, setExtraOptions] = useState({});
    const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
    const [customTypeText, setCustomTypeText] = useState("");

    const getOptions = (type) => {
        const dbValues = (grouped[type] || []).map((ev) => ({
            value: ev.value,
            label: ev.value,
        }));
        const customVals = (extraOptions[type] || []).map((v) => ({
            value: v,
            label: v,
        }));
        return [...dbValues, ...customVals];
    };

    const getSelected = (type) =>
        padCategories
            .filter((c) => c.type === type)
            .map((c) => ({ value: c.value, label: c.value }));

    const handleSelectChange = (type, selectedOptions) => {
        const others = padCategories.filter((c) => c.type !== type);
        const dbValues = (grouped[type] || []).map((ev) => ev.value);
        const newItems = (selectedOptions || []).map((opt) => {
            const dbMatch = (grouped[type] || []).find(
                (ev) => ev.value === opt.value,
            );
            return {
                id: dbMatch?.id,
                type,
                value: opt.value,
                isCustomValue: !dbValues.includes(opt.value),
            };
        });
        onChange([...others, ...newItems]);
    };

    const handleAddCustomValue = (type) => {
        const val = (newValueInput[type] || "").trim();
        if (!val) return;
        setExtraOptions((prev) => ({
            ...prev,
            [type]: [...(prev[type] || []), val],
        }));
        const others = padCategories.filter((c) => c.type !== type);
        const current = padCategories.filter((c) => c.type === type);
        if (!current.some((c) => c.value === val)) {
            onChange([
                ...others,
                ...current,
                { type, value: val, isCustomValue: true },
            ]);
        }
        setNewValueInput((prev) => ({ ...prev, [type]: "" }));
        setShowAddValue((prev) => ({ ...prev, [type]: false }));
    };

    const activateType = (type) => {
        if (!openTypes.includes(type)) setOpenTypes((prev) => [...prev, type]);
    };

    const closeType = (type) => {
        setOpenTypes((prev) => prev.filter((t) => t !== type));
        onChange(padCategories.filter((c) => c.type !== type));
        setShowAddValue((prev) => ({ ...prev, [type]: false }));
        setNewValueInput((prev) => ({ ...prev, [type]: "" }));
    };

    const handleAddCustomType = () => {
        const t = customTypeText.trim();
        if (!t) return;
        activateType(t);
        setCustomTypeText("");
        setShowCustomTypeInput(false);
    };

    const allDisplayTypes = [...new Set([...existingTypes, ...openTypes])];
    const totalSelected = padCategories.length;

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
                <Form.Label
                    className="mb-0 fw-semibold"
                    style={{ fontSize: "13px" }}
                >
                    Categories
                </Form.Label>
                {totalSelected > 0 && (
                    <span
                        className="badge bg-success"
                        style={{ fontSize: "10px" }}
                    >
                        {totalSelected} selected
                    </span>
                )}
            </div>

            <div className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                    <div className="btn-group flex-wrap" role="group">
                        {allDisplayTypes.map((type) => {
                            const isOpen = openTypes.includes(type);
                            const countForType = padCategories.filter(
                                (c) => c.type === type,
                            ).length;
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    className={`btn btn-sm ${isOpen ? "btn-success" : "btn-outline-dark"}`}
                                    onClick={() =>
                                        isOpen
                                            ? closeType(type)
                                            : activateType(type)
                                    }
                                >
                                    {type}
                                    {countForType > 0 && (
                                        <span
                                            className={`badge ms-1 ${isOpen ? "bg-light text-dark" : "bg-primary text-white"}`}
                                            style={{ fontSize: "10px" }}
                                        >
                                            {countForType}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {!showCustomTypeInput ? (
                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => setShowCustomTypeInput(true)}
                            >
                                <i className="bx bx-plus me-1"></i>New Type
                            </button>
                        </div>
                    ) : (
                        <div
                            className="btn-group align-items-center"
                            role="group"
                        >
                            <Form.Control
                                type="text"
                                size="sm"
                                autoFocus
                                placeholder="Type name…"
                                value={customTypeText}
                                style={{ width: "130px" }}
                                onChange={(e) =>
                                    setCustomTypeText(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddCustomType();
                                    }
                                    if (e.key === "Escape") {
                                        setShowCustomTypeInput(false);
                                        setCustomTypeText("");
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="btn btn-warning btn-sm"
                                disabled={!customTypeText.trim()}
                                onClick={handleAddCustomType}
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                    setShowCustomTypeInput(false);
                                    setCustomTypeText("");
                                }}
                            >
                                <i className="bx bx-x"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {openTypes.map((type) => {
                const options = getOptions(type);
                const selected = getSelected(type);
                const isAddingValue = showAddValue[type] || false;

                return (
                    <div
                        key={type}
                        className="border rounded p-2 mb-2"
                        style={{ background: "#f8f9fa" }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <label>{type}</label>
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                style={{ fontSize: "11px" }}
                                onClick={() => closeType(type)}
                            >
                                <i className="bx bx-trash me-1"></i>Close
                            </button>
                        </div>

                        <Select
                            isMulti
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            options={options}
                            value={selected}
                            onChange={(sel) => handleSelectChange(type, sel)}
                            placeholder={
                                options.length === 0
                                    ? "No existing values — add one below"
                                    : `Select ${type} values…`
                            }
                            noOptionsMessage={() => "No values found"}
                            styles={{
                                control: (b) => ({
                                    ...b,
                                    fontSize: "13px",
                                    minHeight: "36px",
                                }),
                                menu: (b) => ({
                                    ...b,
                                    fontSize: "13px",
                                    zIndex: 9999,
                                }),
                                multiValue: (b) => ({
                                    ...b,
                                    background: "#e7f3ff",
                                }),
                                multiValueLabel: (b) => ({
                                    ...b,
                                    color: "#0d6efd",
                                }),
                            }}
                        />

                        <div className="mt-2">
                            {!isAddingValue ? (
                                <button
                                    type="button"
                                    className="btn btn-link btn-sm p-0 text-success"
                                    style={{ fontSize: "12px" }}
                                    onClick={() =>
                                        setShowAddValue((prev) => ({
                                            ...prev,
                                            [type]: true,
                                        }))
                                    }
                                >
                                    <i className="bx bx-plus me-1"></i>Add new
                                    value
                                </button>
                            ) : (
                                <div className="d-flex gap-2 align-items-center">
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        autoFocus
                                        placeholder={`New ${type} value…`}
                                        value={newValueInput[type] || ""}
                                        onChange={(e) =>
                                            setNewValueInput((prev) => ({
                                                ...prev,
                                                [type]: e.target.value,
                                            }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddCustomValue(type);
                                            }
                                            if (e.key === "Escape") {
                                                setShowAddValue((prev) => ({
                                                    ...prev,
                                                    [type]: false,
                                                }));
                                                setNewValueInput((prev) => ({
                                                    ...prev,
                                                    [type]: "",
                                                }));
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        style={{ whiteSpace: "nowrap" }}
                                        disabled={
                                            !(newValueInput[type] || "").trim()
                                        }
                                        onClick={() =>
                                            handleAddCustomValue(type)
                                        }
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => {
                                            setShowAddValue((prev) => ({
                                                ...prev,
                                                [type]: false,
                                            }));
                                            setNewValueInput((prev) => ({
                                                ...prev,
                                                [type]: "",
                                            }));
                                        }}
                                    >
                                        <i className="bx bx-x"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ── Main Edit ────────────────────────────────────────────────────────────────
const Edit = ({ kirtan, categories }) => {
    // Normalise pads coming from Laravel (matches controller edit() payload)
    const normalisePads = (pads = []) =>
        pads.map((p) => ({
            id: p.id,
            title: p.title ?? "",
            value: p.value ?? "",
            status: p.status ?? "draft",
            establish_date: p.establish_date ?? "",
            categories: (p.categories ?? []).map((c) => ({
                id: c.id,
                type: c.type,
                value: c.value,
            })),
            recorded_version: p.recorded_version
                ? {
                      id: p.recorded_version.id,
                      media_type: p.recorded_version.media_type ?? "",
                      file: null, // new upload only; existing file via file_url
                      file_url: p.recorded_version.file_url ?? null,
                      singer: p.recorded_version.singer ?? "",
                      publisher: p.recorded_version.publisher ?? "",
                      vocalization: p.recorded_version.vocalization ?? "",
                      recording_type: p.recorded_version.recording_type ?? "",
                  }
                : {
                      media_type: "",
                      file: null,
                      file_url: null,
                      singer: "",
                      publisher: "",
                      vocalization: "",
                      recording_type: "",
                  },
        }));

    const { data, setData, put, processing, errors } = useForm({
        title: kirtan.title ?? "",
        status: kirtan.status ?? "draft",
        pads: normalisePads(kirtan.pads),
    });

    const addPad = () =>
        setData("pads", [
            ...data.pads,
            {
                title: "",
                value: "",
                status: "draft",
                establish_date: "",
                categories: [],
                recorded_version: {
                    media_type: "",
                    file: null,
                    file_url: null,
                    singer: "",
                    publisher: "",
                    vocalization: "",
                    recording_type: "",
                },
            },
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

    const updateRecordedVersion = (index, field, value) => {
        const updated = [...data.pads];
        updated[index].recorded_version = {
            ...updated[index].recorded_version,
            [field]: value,
        };
        setData("pads", updated);
    };

    const handleSubmit = () => {
        router.post(
            route("admin.kirtans.update", kirtan.id),
            {
                ...data,
                _method: "put",
            },
            {
                forceFormData: true, // needed for file uploads
                onSuccess: () => toast.success("Kirtan updated successfully!"),
                onError: (errs) => {
                    console.log("Validation errors:", errs);
                    console.log("Submitted data:", data);
                    toast.error("Please fix the errors below.");
                },
            },
        );
    };

    return (
        <React.Fragment>
            <Head title="Edit Kirtan" />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Edit Kirtan" pageTitle="Kirtans" />
                    <Row>
                        <Col lg={12}>
                            {/* Kirtan Details */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        Kirtan Details
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col lg={8}>
                                            <Form.Group>
                                                <Form.Label htmlFor="kirtan-title">
                                                    Kirtan Title{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="kirtan-title"
                                                    placeholder="Enter kirtan title"
                                                    value={data.title}
                                                    onChange={(e) =>
                                                        setData(
                                                            "title",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={!!errors.title}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.title}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col lg={4}>
                                            <Form.Group>
                                                <Form.Label htmlFor="kirtan-status">
                                                    Status
                                                </Form.Label>
                                                <Form.Select
                                                    id="kirtan-status"
                                                    value={data.status}
                                                    onChange={(e) =>
                                                        setData(
                                                            "status",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={!!errors.status}
                                                >
                                                    <option value="save">
                                                        Publish
                                                    </option>
                                                    <option value="draft">
                                                        Draft
                                                    </option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.status}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Pads */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        Pads{" "}
                                        <span className="badge bg-info ms-1">
                                            {data.pads.length}
                                        </span>
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        onClick={addPad}
                                    >
                                        <i className="bx bx-plus me-1"></i>Add
                                        Pad
                                    </button>
                                </Card.Header>
                                <Card.Body>
                                    {data.pads.length === 0 && (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bx bx-music display-5 d-block mb-2"></i>
                                            <p className="mb-3">
                                                No pads added yet.
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-outline-success btn-sm"
                                                onClick={addPad}
                                            >
                                                + Add First Pad
                                            </button>
                                        </div>
                                    )}

                                    {data.pads.map((pad, index) => (
                                        <div
                                            key={pad.id ?? `new-${index}`}
                                            className="border rounded p-3 mb-3"
                                            style={{
                                                background: "var(--vz-light)",
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0 text-primary fw-semibold">
                                                    <i className="bx bx-music me-1"></i>
                                                    Pad {index + 1}
                                                    {pad.id && (
                                                        <span
                                                            className="badge bg-secondary ms-2"
                                                            style={{
                                                                fontSize:
                                                                    "10px",
                                                            }}
                                                        >
                                                            ID #{pad.id}
                                                        </span>
                                                    )}
                                                </h6>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        removePad(index)
                                                    }
                                                >
                                                    <i className="bx bx-trash me-1"></i>
                                                    Remove
                                                </button>
                                            </div>

                                            <Row>
                                                <Col lg={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>
                                                            Pad Title{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={`Enter pad ${index + 1} title`}
                                                            value={pad.title}
                                                            onChange={(e) =>
                                                                updatePad(
                                                                    index,
                                                                    "title",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            isInvalid={
                                                                !!errors[
                                                                    `pads.${index}.title`
                                                                ]
                                                            }
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {
                                                                errors[
                                                                    `pads.${index}.title`
                                                                ]
                                                            }
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                <Col lg={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>
                                                            Lyrics (Value){" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={4}
                                                            placeholder="Enter lyrics..."
                                                            value={pad.value}
                                                            onChange={(e) =>
                                                                updatePad(
                                                                    index,
                                                                    "value",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            isInvalid={
                                                                !!errors[
                                                                    `pads.${index}.value`
                                                                ]
                                                            }
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {
                                                                errors[
                                                                    `pads.${index}.value`
                                                                ]
                                                            }
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                <Col lg={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>
                                                            Establish Date
                                                        </Form.Label>
                                                        <Flatpickr
                                                            className="form-control"
                                                            placeholder="Select date"
                                                            value={
                                                                pad.establish_date ||
                                                                ""
                                                            }
                                                            options={{
                                                                dateFormat:
                                                                    "Y-m-d",
                                                            }}
                                                            onChange={([
                                                                date,
                                                            ]) => {
                                                                const formatted =
                                                                    date
                                                                        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                                                        : "";
                                                                updatePad(
                                                                    index,
                                                                    "establish_date",
                                                                    formatted,
                                                                );
                                                            }}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col lg={12}>
                                                    <Form.Group className="mb-3">
                                                        <div className="form-check mt-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`pad-draft-${index}`}
                                                                checked={
                                                                    pad.status ===
                                                                    "draft"
                                                                }
                                                                onChange={(e) =>
                                                                    updatePad(
                                                                        index,
                                                                        "status",
                                                                        e.target
                                                                            .checked
                                                                            ? "draft"
                                                                            : "save",
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor={`pad-draft-${index}`}
                                                                style={{
                                                                    fontSize:
                                                                        "13px",
                                                                }}
                                                            >
                                                                {pad.status ===
                                                                "save"
                                                                    ? "Published"
                                                                    : "Draft"}
                                                            </label>
                                                        </div>
                                                    </Form.Group>
                                                </Col>

                                                <Col lg={12}>
                                                    <div
                                                        className="p-3 rounded border mb-3"
                                                        style={{
                                                            background: "#fff",
                                                        }}
                                                    >
                                                        <PadCategorySelector
                                                            padIndex={index}
                                                            padCategories={
                                                                pad.categories ??
                                                                []
                                                            }
                                                            allCategories={
                                                                categories ?? []
                                                            }
                                                            onChange={(cats) =>
                                                                updatePad(
                                                                    index,
                                                                    "categories",
                                                                    cats,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </Col>

                                                {/* Recorded Version (from controller) */}
                                                <Col lg={12}>
                                                    <div
                                                        className="p-3 rounded border"
                                                        style={{
                                                            background: "#fff",
                                                        }}
                                                    >
                                                        <h6 className="mb-3 fw-semibold">
                                                            Recorded Version
                                                            {pad
                                                                .recorded_version
                                                                ?.id && (
                                                                <span
                                                                    className="badge bg-secondary ms-2"
                                                                    style={{
                                                                        fontSize:
                                                                            "10px",
                                                                    }}
                                                                >
                                                                    ID #
                                                                    {
                                                                        pad
                                                                            .recorded_version
                                                                            .id
                                                                    }
                                                                </span>
                                                            )}
                                                        </h6>
                                                        <Row className="g-3">
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>
                                                                        Media
                                                                        Type
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder="e.g. audio, video"
                                                                        value={
                                                                            pad
                                                                                .recorded_version
                                                                                ?.media_type ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateRecordedVersion(
                                                                                index,
                                                                                "media_type",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>
                                                                        Recording
                                                                        Type
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder="Recording type"
                                                                        value={
                                                                            pad
                                                                                .recorded_version
                                                                                ?.recording_type ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateRecordedVersion(
                                                                                index,
                                                                                "recording_type",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>
                                                                        Singer
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder="Singer name"
                                                                        value={
                                                                            pad
                                                                                .recorded_version
                                                                                ?.singer ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateRecordedVersion(
                                                                                index,
                                                                                "singer",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>
                                                                        Publisher
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder="Publisher"
                                                                        value={
                                                                            pad
                                                                                .recorded_version
                                                                                ?.publisher ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateRecordedVersion(
                                                                                index,
                                                                                "publisher",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>
                                                                        Vocalization
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder="Vocalization"
                                                                        value={
                                                                            pad
                                                                                .recorded_version
                                                                                ?.vocalization ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateRecordedVersion(
                                                                                index,
                                                                                "vocalization",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>
                                                                        File
                                                                    </Form.Label>
                                                                    {pad
                                                                        .recorded_version
                                                                        ?.file_url && (
                                                                        <div className="mb-2">
                                                                            <audio
                                                                                controls
                                                                                src={
                                                                                    pad.recorded_version.file_url.includes(
                                                                                        "/storage/",
                                                                                    )
                                                                                        ? pad
                                                                                              .recorded_version
                                                                                              .file_url
                                                                                        : `/storage/pad-media/${pad.recorded_version.file_url
                                                                                              .split(
                                                                                                  "/",
                                                                                              )
                                                                                              .pop()}`
                                                                                }
                                                                                className="w-100"
                                                                                style={{
                                                                                    maxHeight: 40,
                                                                                }}
                                                                            >
                                                                                Your
                                                                                browser
                                                                                does
                                                                                not
                                                                                support
                                                                                the
                                                                                audio
                                                                                element.
                                                                            </audio>
                                                                        </div>
                                                                    )}
                                                                    <Form.Control
                                                                        type="file"
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateRecordedVersion(
                                                                                index,
                                                                                "file",
                                                                                e
                                                                                    .target
                                                                                    .files?.[0] ??
                                                                                    null,
                                                                            )
                                                                        }
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}

                                    {data.pads.length > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-success btn-sm w-100"
                                            onClick={addPad}
                                        >
                                            <i className="bx bx-plus me-1"></i>
                                            Add Another Pad
                                        </button>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Action Buttons */}
                            <div className="text-end mb-4">
                                <Link
                                    href={route("admin.kirtans.list")}
                                    className="btn btn-secondary w-sm me-1"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="button"
                                    className="btn btn-success w-sm"
                                    disabled={processing}
                                    onClick={handleSubmit}
                                >
                                    {processing ? "Saving..." : "Update Kirtan"}
                                </button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

Edit.layout = (page) => <Layout children={page} />;
export default Edit;
