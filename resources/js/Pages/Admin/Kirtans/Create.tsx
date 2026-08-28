// resources/js/Pages/Admin/Pads/Create.jsx

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

// ── CategorySelector ──────────────────────────────────────────────────────────
const CategorySelector = ({
    categories = [],
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
    const [openTypes, setOpenTypes] = useState([]);
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
        categories
            .filter((c) => c.type === type)
            .map((c) => ({ value: c.value, label: c.value }));

    const handleSelectChange = (type, selectedOptions) => {
        const others = categories.filter((c) => c.type !== type);
        const dbValues = (grouped[type] || []).map((ev) => ev.value);
        const newItems = (selectedOptions || []).map((opt) => ({
            type,
            value: opt.value,
            isCustomValue: !dbValues.includes(opt.value),
        }));
        onChange([...others, ...newItems]);
    };

    const handleAddCustomValue = (type) => {
        const val = (newValueInput[type] || "").trim();
        if (!val) return;

        setExtraOptions((prev) => ({
            ...prev,
            [type]: [...(prev[type] || []), val],
        }));

        const others = categories.filter((c) => c.type !== type);
        const current = categories.filter((c) => c.type === type);
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
        if (!openTypes.includes(type)) {
            setOpenTypes((prev) => [...prev, type]);
        }
    };

    const closeType = (type) => {
        setOpenTypes((prev) => prev.filter((t) => t !== type));
        onChange(categories.filter((c) => c.type !== type));
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
    const totalSelected = categories.length;

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
                            const countForType = categories.filter(
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
                                control: (base) => ({
                                    ...base,
                                    fontSize: "13px",
                                    minHeight: "36px",
                                }),
                                menu: (base) => ({
                                    ...base,
                                    fontSize: "13px",
                                    zIndex: 9999,
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    background: "#e7f3ff",
                                }),
                                multiValueLabel: (base) => ({
                                    ...base,
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

// ── Main Create ───────────────────────────────────────────────────────────────
const Create = ({ categories = [] }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        value: "",
        status: "draft",
        establish_date: "",
        categories: [],
        recorded_version: {
            file: null,
            singer: "",
            publisher: "",
            vocalization: "",
            recording_type: "",
            media_type: "",
        },
    });

    const updateRecordedVersion = (field, value) => {
        setData("recorded_version", {
            ...data.recorded_version,
            [field]: value,
        });
    };

    const handleSubmit = (submitStatus) => {
        // Set status then submit (forceFormData for file upload)
        setData("status", submitStatus);

        setTimeout(() => {
            post(route("admin.pads.store"), {
                forceFormData: true,
                onSuccess: () => {
                    toast.success("Pad created successfully!");
                    reset();
                },
                onError: () => {
                    toast.error("Please fix the errors below.");
                },
            });
        }, 50);
    };

    return (
        <React.Fragment>
            <Head title="Add Pad" />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Add Pad" pageTitle="Pads" />
                    <Row>
                        <Col lg={12}>
                            {/* Pad Details */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        Pad Details
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col lg={12}>
                                            <Form.Group>
                                                <Form.Label htmlFor="pad-title">
                                                    Pad Title{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="pad-title"
                                                    placeholder="Enter pad title"
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

                                        <Col lg={12}>
                                            <Form.Group>
                                                <Form.Label htmlFor="pad-value">
                                                    Lyrics (Value){" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    id="pad-value"
                                                    rows={6}
                                                    placeholder="Enter lyrics..."
                                                    value={data.value}
                                                    onChange={(e) =>
                                                        setData(
                                                            "value",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={!!errors.value}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.value}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    Establish Date
                                                </Form.Label>
                                                <Flatpickr
                                                    value={
                                                        data.establish_date ||
                                                        ""
                                                    }
                                                    className="form-control"
                                                    placeholder="Select date"
                                                    options={{
                                                        dateFormat: "Y-m-d",
                                                    }}
                                                    onChange={(
                                                        _dates,
                                                        dateStr,
                                                    ) =>
                                                        setData(
                                                            "establish_date",
                                                            dateStr,
                                                        )
                                                    }
                                                />
                                                {errors.establish_date && (
                                                    <div className="text-danger small mt-1">
                                                        {errors.establish_date}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}>
                                            <Form.Group>
                                                <Form.Label className="d-block">
                                                    Status
                                                </Form.Label>
                                                <div className="form-check mt-2">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="pad-draft"
                                                        checked={
                                                            data.status ===
                                                            "draft"
                                                        }
                                                        onChange={(e) =>
                                                            setData(
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
                                                        htmlFor="pad-draft"
                                                        style={{
                                                            fontSize: "13px",
                                                        }}
                                                    >
                                                        {data.status === "save"
                                                            ? "Published"
                                                            : "Draft"}
                                                    </label>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Categories */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        Categories
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <CategorySelector
                                        categories={data.categories ?? []}
                                        allCategories={categories}
                                        onChange={(cats) =>
                                            setData("categories", cats)
                                        }
                                    />
                                </Card.Body>
                            </Card>

                            {/* Recorded Version */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        Recorded Version
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col lg={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    Upload Audio / Video
                                                </Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    accept="audio/*,video/*"
                                                    onChange={(e) =>
                                                        updateRecordedVersion(
                                                            "file",
                                                            e.target
                                                                .files?.[0] ||
                                                                null,
                                                        )
                                                    }
                                                />
                                                {data.recorded_version
                                                    ?.file && (
                                                    <small className="text-success">
                                                        Selected:{" "}
                                                        {
                                                            data
                                                                .recorded_version
                                                                .file.name
                                                        }
                                                    </small>
                                                )}
                                                {errors[
                                                    "recorded_version.file"
                                                ] && (
                                                    <div className="text-danger small mt-1">
                                                        {
                                                            errors[
                                                                "recorded_version.file"
                                                            ]
                                                        }
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    Singer
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Singer name"
                                                    value={
                                                        data.recorded_version
                                                            ?.singer || ""
                                                    }
                                                    onChange={(e) =>
                                                        updateRecordedVersion(
                                                            "singer",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    Vocalization{" "}
                                                    <span className="text-muted">
                                                        (svarakara)
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Vocalization"
                                                    value={
                                                        data.recorded_version
                                                            ?.vocalization || ""
                                                    }
                                                    onChange={(e) =>
                                                        updateRecordedVersion(
                                                            "vocalization",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col lg={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    Publisher
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder="Publisher details"
                                                    value={
                                                        data.recorded_version
                                                            ?.publisher || ""
                                                    }
                                                    onChange={(e) =>
                                                        updateRecordedVersion(
                                                            "publisher",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    Live / Studio
                                                </Form.Label>
                                                <Form.Select
                                                    value={
                                                        data.recorded_version
                                                            ?.recording_type ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        updateRecordedVersion(
                                                            "recording_type",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select…
                                                    </option>
                                                    <option value="live">
                                                        Live
                                                    </option>
                                                    <option value="studio">
                                                        Studio
                                                    </option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    Audio / Video
                                                </Form.Label>
                                                <Form.Select
                                                    value={
                                                        data.recorded_version
                                                            ?.media_type || ""
                                                    }
                                                    onChange={(e) =>
                                                        updateRecordedVersion(
                                                            "media_type",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select…
                                                    </option>
                                                    <option value="audio">
                                                        Audio
                                                    </option>
                                                    <option value="video">
                                                        Video
                                                    </option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Actions */}
                            <div className="text-end mb-4">
                                <Link
                                    href={route("admin.pads.list")}
                                    className="btn btn-secondary w-sm me-1"
                                >
                                    Cancel
                                </Link>
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
                                    {processing ? "Saving..." : "Save Pad"}
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