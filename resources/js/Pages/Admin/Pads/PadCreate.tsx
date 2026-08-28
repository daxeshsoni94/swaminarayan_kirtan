import React, { useState, useMemo } from "react";
import { Card, Col, Container, Form, Row, Button } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { usePermission } from "../../../hooks/usePermission";

const animatedComponents = makeAnimated();

const t = (v, locale = "en") => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") return v[locale] ?? v.en ?? v.gu ?? "";
    return String(v);
};

// ── CategorySelector (unchanged) ──────────────────────────────────────────────
const CategorySelector = ({
    categories = [],
    onChange,
    allCategories = [],
    locale = "en",
}) => {
    const grouped = useMemo(() => {
        return allCategories.reduce((acc, c) => {
            const type = t(c.type, locale); // string, not object
            const value = t(c.value, locale);
            if (!type) return acc;
            if (!acc[type]) acc[type] = [];
            acc[type].push({ id: c.id, value });
            return acc;
        }, {});
    }, [allCategories, locale]);

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
            .filter((c) => t(c.type, locale) === type)
            .map((c) => {
                const value = t(c.value, locale);
                return { value, label: value };
            });

    const handleSelectChange = (type, selectedOptions) => {
        const others = categories.filter((c) => t(c.type, locale) !== type);
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

    const isGu = locale === "gu";
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
                                <i className="bx bx-plus me-1"></i>
                                {isGu ? "નવો પ્રકાર" : "New Type"}
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
                                placeholder={isGu ? "નામ લખો..." : "Type name…"}
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
                                {isGu ? "ઉમેરો" : "Add"}
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
                                <i className="bx bx-trash me-1"></i>{" "}
                                {isGu ? "બંધ કરો" : "Close"}
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
                                    ? isGu
                                        ? "કોઈ વૅલ્યુ ઉપલબ્ધ નથી — નીચે એક ઉમેરો"
                                        : "No existing values — add one below"
                                    : isGu
                                      ? `${type} વૅલ્યુ પસંદ કરો…`
                                      : `Select ${type} values…`
                            }
                            noOptionsMessage={() =>
                                isGu
                                    ? "કોઈ વૅલ્યુ ઉપલબ્ધ નથી"
                                    : "No values found"
                            }
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
                                    <i className="bx bx-plus me-1"></i>
                                    {isGu
                                        ? "નવી વૅલ્યુ ઉમેરો"
                                        : "Add new value"}
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
                                        {isGu ? "ઉમેરો" : "Add"}
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

// Helper: empty recorded version template
const emptyRecordedVersion = () => ({
    file: null as File | null,
    singer: { en: "", gu: "" },
    publisher: { en: "", gu: "" },
    vocalization: { en: "", gu: "" },
    recording_type: "",
    media_type: "",
});

const PadCreate = ({ categories = [] }) => {
    const page = usePage().props as { locale?: string };
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";

    // ── Permission check ────────────────────────────────────────────────
    const { can } = usePermission();

    // If the user does not have "create" permission → redirect to list
    React.useEffect(() => {
        if (!can("pads", "create")) {
            toast.error(
                locale === "gu"
                    ? "તમને પદ બનાવવાની પરવાનગી નથી."
                    : "You do not have permission to create pads.",
            );

            router.visit(
                route("role.pads.list", {
                    rolePrefix: rolePrefix,
                }),
            );
        }
    }, [can, locale]);

    // Optional: also block rendering while redirecting
    if (!can("pads", "create")) {
        return null; // or a simple "Unauthorized" message
    }
    const { data, setData, post, processing, errors, reset } = useForm({
        title: { en: "", gu: "" },
        value: { en: "", gu: "" },
        status: "draft",
        establish_date: "",
        categories: [],
        recorded_versions: [emptyRecordedVersion()], // ← array now
        locale,
    });

    React.useEffect(() => {
        setData("locale", locale);
    }, [locale]);

    // ── Recorded versions helpers ─────────────────────────────────────────────
    const updateRecordedVersion = (
        index: number,
        field: string,
        value: any,
    ) => {
        const updated = [...data.recorded_versions];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        setData("recorded_versions", updated);
    };

    const setRvTranslation = (
        index: number,
        field: "singer" | "publisher" | "vocalization",
        text: string,
    ) => {
        const updated = [...data.recorded_versions];
        updated[index] = {
            ...updated[index],
            [field]: {
                ...updated[index][field],
                [locale]: text,
            },
        };
        setData("recorded_versions", updated);
    };

    const addRecordedVersion = () => {
        setData("recorded_versions", [
            ...data.recorded_versions,
            emptyRecordedVersion(),
        ]);
    };

    const removeRecordedVersion = (index: number) => {
        if (data.recorded_versions.length <= 1) return; // keep at least one
        const updated = data.recorded_versions.filter((_, i) => i !== index);
        setData("recorded_versions", updated);
    };

    // ── Translation helpers ───────────────────────────────────────────────────
    const setTranslation = (field: "title" | "value", text: string) => {
        setData(field, {
            ...data[field],
            [locale]: text,
        });
    };

    const handleSubmit = (submitStatus: string) => {
        setData("status", submitStatus);
        setData("locale", locale);

        setTimeout(() => {
            post(
                route("role.pads.store", {
                    rolePrefix: rolePrefix,
                }),
                {
                    forceFormData: true,
                    onSuccess: () => {
                        toast.success("Pad created successfully!");
                        reset();
                    },
                    onError: () => {
                        toast.error("Please fix the errors below.");
                    },
                },
            );
        }, 50);
    };

    const isGu = locale === "gu";

    return (
        <React.Fragment>
            <Head title="Add Pad" />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={isGu ? "પદ ઉમેરો" : "Add Pad"}
                        pageTitle={isGu ? "પદ" : "Pads"}
                    />

                    <div className="mb-3">
                        <small className="text-muted">
                            {isGu
                                ? "બીજી ભાષાનું અનુવાદ ઉમેરવા માટે હેડર ટૉગલમાંથી ભાષા બદલો."
                                : "Switch language from the header toggle to fill the other translation."}
                        </small>
                    </div>

                    <Row>
                        <Col lg={12}>
                            {/* ── Pad Details ─────────────────────────────── */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isGu ? "પદની વિગતો" : "Pad Details"}
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col lg={12}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isGu
                                                        ? "પદનું શીર્ષક"
                                                        : "Pad Title"}{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder={
                                                        isGu
                                                            ? "શીર્ષક (ગુજરાતી)"
                                                            : "Title (English)"
                                                    }
                                                    value={
                                                        data.title[locale] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setTranslation(
                                                            "title",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors[
                                                            `title.${locale}`
                                                        ] || !!errors.title
                                                    }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors[
                                                        `title.${locale}`
                                                    ] || errors.title}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col lg={12}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isGu ? "ગીત" : "Lyrics"}{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={6}
                                                    placeholder={
                                                        isGu
                                                            ? "ગીતના શબ્દો લખો..."
                                                            : "Enter lyrics..."
                                                    }
                                                    value={
                                                        data.value[locale] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setTranslation(
                                                            "value",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors[
                                                            `value.${locale}`
                                                        ] || !!errors.value
                                                    }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors[
                                                        `value.${locale}`
                                                    ] || errors.value}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isGu
                                                        ? "સ્થાપના તારીખ"
                                                        : "Establish Date"}
                                                </Form.Label>
                                                <Flatpickr
                                                    value={
                                                        data.establish_date ||
                                                        ""
                                                    }
                                                    className="form-control"
                                                    placeholder={
                                                        isGu
                                                            ? "તારીખ પસંદ કરો..."
                                                            : "Select Date"
                                                    }
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
                                                    {isGu
                                                        ? "સ્ટેટ્સ"
                                                        : "Status"}
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
                                                                e.target.checked
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
                                                            ? isGu
                                                                ? "પ્રકાશિત"
                                                                : "Published"
                                                            : isGu
                                                              ? "ડ્રાફ્ટ"
                                                              : "Draft"}
                                                    </label>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* ── Categories ──────────────────────────────── */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isGu ? "શ્રેણીઓ" : "Categories"}
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <CategorySelector
                                        categories={data.categories ?? []}
                                        allCategories={categories}
                                        locale={locale}
                                        onChange={(cats) =>
                                            setData("categories", cats)
                                        }
                                    />
                                </Card.Body>
                            </Card>

                            {/* ── Recorded Versions (multiple) ────────────── */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        {isGu
                                            ? "રેકોર્ડ કરેલ સંસ્કરણો"
                                            : "Recorded Versions"}
                                    </h5>
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        type="button"
                                        onClick={addRecordedVersion}
                                    >
                                        <i className="bx bx-plus me-1"></i>
                                        {isGu
                                            ? "બીજું સંસ્કરણ ઉમેરો"
                                            : "Add another version"}
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    {data.recorded_versions.map((rv, index) => (
                                        <div
                                            key={index}
                                            className="border rounded p-3 mb-3"
                                            style={{ background: "#f8f9fa" }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <strong>
                                                    {isGu
                                                        ? `સંસ્કરણ #${index + 1}`
                                                        : `Version #${index + 1}`}
                                                </strong>
                                                {data.recorded_versions.length >
                                                    1 && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        type="button"
                                                        onClick={() =>
                                                            removeRecordedVersion(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <i className="bx bx-trash me-1"></i>
                                                        {isGu
                                                            ? "કાઢી નાખો"
                                                            : "Remove"}
                                                    </Button>
                                                )}
                                            </div>

                                            <Row>
                                                {/* File */}
                                                <Col lg={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {isGu
                                                                ? "ઑડિયો/વિડિયો ફાઇલ"
                                                                : "Upload Audio / Video"}
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="file"
                                                            accept="audio/*,video/*"
                                                            onChange={(e) =>
                                                                updateRecordedVersion(
                                                                    index,
                                                                    "file",
                                                                    e.target
                                                                        .files?.[0] ||
                                                                        null,
                                                                )
                                                            }
                                                        />
                                                        {rv.file && (
                                                            <small className="text-success">
                                                                Selected:{" "}
                                                                {rv.file.name}
                                                            </small>
                                                        )}
                                                        {errors[
                                                            `recorded_versions.${index}.file`
                                                        ] && (
                                                            <div className="text-danger small mt-1">
                                                                {
                                                                    errors[
                                                                        `recorded_versions.${index}.file`
                                                                    ]
                                                                }
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>

                                                {/* Singer */}
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {isGu
                                                                ? "ગાયક"
                                                                : "Singer"}
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={
                                                                isGu
                                                                    ? "ગાયકનું નામ"
                                                                    : "Singer name"
                                                            }
                                                            value={
                                                                rv.singer?.[
                                                                    locale
                                                                ] ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                setRvTranslation(
                                                                    index,
                                                                    "singer",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Vocalization */}
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {isGu
                                                                ? "ઉચ્ચારણ"
                                                                : "Vocalization"}
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={
                                                                isGu
                                                                    ? "સ્વરકાર ..."
                                                                    : "Vocalization"
                                                            }
                                                            value={
                                                                rv
                                                                    .vocalization?.[
                                                                    locale
                                                                ] ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                setRvTranslation(
                                                                    index,
                                                                    "vocalization",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Publisher */}
                                                <Col lg={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {isGu
                                                                ? "પ્રકાશક"
                                                                : "Publisher"}
                                                        </Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            placeholder={
                                                                isGu
                                                                    ? "પ્રકાશક વિગતો ..."
                                                                    : "Publisher details"
                                                            }
                                                            value={
                                                                rv.publisher?.[
                                                                    locale
                                                                ] ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                setRvTranslation(
                                                                    index,
                                                                    "publisher",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Recording type */}
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {isGu
                                                                ? "લાઈવ / સ્ટુડિયો"
                                                                : "Live / Studio"}
                                                        </Form.Label>
                                                        <Form.Select
                                                            value={
                                                                rv.recording_type ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                updateRecordedVersion(
                                                                    index,
                                                                    "recording_type",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                {isGu
                                                                    ? "પસંદ કરો..."
                                                                    : "Select…"}
                                                            </option>
                                                            <option value="live">
                                                                {isGu
                                                                    ? "લાઈવ"
                                                                    : "Live"}
                                                            </option>
                                                            <option value="studio">
                                                                {isGu
                                                                    ? "સ્ટુડિયો"
                                                                    : "Studio"}
                                                            </option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>

                                                {/* Media type */}
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {isGu
                                                                ? "ઑડિયો / વિડિયો"
                                                                : "Audio / Video"}
                                                        </Form.Label>
                                                        <Form.Select
                                                            value={
                                                                rv.media_type ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                updateRecordedVersion(
                                                                    index,
                                                                    "media_type",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                {isGu
                                                                    ? "પસંદ કરો..."
                                                                    : "Select…"}
                                                            </option>
                                                            <option value="audio">
                                                                {isGu
                                                                    ? "ઑડિયો"
                                                                    : "Audio"}
                                                            </option>
                                                            <option value="video">
                                                                {isGu
                                                                    ? "વિડિયો"
                                                                    : "Video"}
                                                            </option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>

                            {/* ── Actions ─────────────────────────────────── */}
                            <div className="text-end mb-4">
                                <Link
                                    href={route("role.pads.list", {
                                        rolePrefix,
                                    })}
                                    className="btn btn-secondary w-sm me-1"
                                >
                                    {isGu ? "રદ કરો" : "Cancel"}
                                </Link>
                                <button
                                    type="button"
                                    className="btn btn-warning w-sm me-1"
                                    disabled={processing}
                                    onClick={() => handleSubmit("draft")}
                                >
                                    {isGu
                                        ? "ડ્રાફ્ટ તરીકે સાચવો"
                                        : "Save as Draft"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success w-sm"
                                    disabled={processing}
                                    onClick={() => handleSubmit("save")}
                                >
                                    {processing
                                        ? isGu
                                            ? "સેવ થઈ રહ્યુ છે"
                                            : "Saving..."
                                        : isGu
                                          ? "સેવ કરો"
                                          : "Save Pad"}
                                </button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

PadCreate.layout = (page) => <Layout children={page} />;
export default PadCreate;
