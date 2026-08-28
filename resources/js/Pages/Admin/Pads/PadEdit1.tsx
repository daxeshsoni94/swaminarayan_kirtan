// resources/js/Pages/Admin/Pads/Edit.jsx

import React, { useState, useMemo, useEffect } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

// ── Resolve translation object → string ───────────────────────────────────────
const t = (v: any, locale = "en"): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
        return v[locale] ?? v.en ?? v.gu ?? Object.values(v)[0] ?? "";
    }
    return String(v);
};

// Normalize any value to { en, gu }
const toTrans = (v: any): { en: string; gu: string } => {
    if (v == null) return { en: "", gu: "" };
    if (typeof v === "string") return { en: v, gu: "" };
    return {
        en: v.en ?? "",
        gu: v.gu ?? "",
    };
};

// ── CategorySelector ──────────────────────────────────────────────────────────
const CategorySelector = ({
    categories = [],
    onChange,
    allCategories = [],
    locale = "en",
}: {
    categories?: any[];
    onChange: (cats: any[]) => void;
    allCategories?: any[];
    locale?: string;
}) => {
    const grouped = useMemo(() => {
        return allCategories.reduce((acc: Record<string, any[]>, c) => {
            const type = t(c.type, locale);
            const value = t(c.value, locale);
            if (!type) return acc;
            if (!acc[type]) acc[type] = [];
            acc[type].push({ id: c.id, value });
            return acc;
        }, {});
    }, [allCategories, locale]);

    const existingTypes = Object.keys(grouped);
    const [openTypes, setOpenTypes] = useState<string[]>(() => [
        ...new Set(categories.map((c) => t(c.type, locale)).filter(Boolean)),
    ]);
    const [showAddValue, setShowAddValue] = useState<Record<string, boolean>>(
        {},
    );
    const [newValueInput, setNewValueInput] = useState<Record<string, string>>(
        {},
    );
    const [extraOptions, setExtraOptions] = useState<Record<string, string[]>>(
        {},
    );
    const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
    const [customTypeText, setCustomTypeText] = useState("");

    // Re-open selected types when locale changes
    useEffect(() => {
        setOpenTypes([
            ...new Set(
                categories.map((c) => t(c.type, locale)).filter(Boolean),
            ),
        ]);
    }, [locale]);

    const getOptions = (type: string) => {
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

                return {
                    value,
                    label: value,
                    id: c.id,
                };
            });


    const handleSelectChange = (type, selectedOptions) => {
        const others = categories.filter((c) => t(c.type, locale) !== type);

        const newItems = (selectedOptions || []).map((opt) => {
            const dbMatch = (grouped[type] || []).find(
                (ev) => ev.value === opt.value,
            );

            if (dbMatch) {
                const originalCategory = allCategories.find(
                    (c) => c.id === dbMatch.id,
                );

                return {
                    id: originalCategory?.id,
                    type: originalCategory?.type,
                    value: originalCategory?.value,
                    isCustomValue: false,
                };
            }

            return {
                type: type,
                value: opt.value,
                isCustomValue: true,
            };
        });

        onChange([...others, ...newItems]);
    };
    const handleAddCustomValue = (type: string) => {
        const val = (newValueInput[type] || "").trim();
        if (!val) return;
        setExtraOptions((prev) => ({
            ...prev,
            [type]: [...(prev[type] || []), val],
        }));
        const others = categories.filter((c) => t(c.type, locale) !== type);
        const current = categories.filter((c) => t(c.type, locale) === type);
        if (!current.some((c) => t(c.value, locale) === val)) {
            onChange([
                ...others,
                ...current,
                { type, value: val, isCustomValue: true },
            ]);
        }
        setNewValueInput((prev) => ({ ...prev, [type]: "" }));
        setShowAddValue((prev) => ({ ...prev, [type]: false }));
    };

    const activateType = (type: string) => {
        if (!openTypes.includes(type)) setOpenTypes((prev) => [...prev, type]);
    };

    const closeType = (type: string) => {
        setOpenTypes((prev) => prev.filter((x) => x !== type));
        onChange(categories.filter((c) => t(c.type, locale) !== type));
        setShowAddValue((prev) => ({ ...prev, [type]: false }));
        setNewValueInput((prev) => ({ ...prev, [type]: "" }));
    };

    const handleAddCustomType = () => {
        const name = customTypeText.trim();
        if (!name) return;
        activateType(name);
        setCustomTypeText("");
        setShowCustomTypeInput(false);
    };

    const allDisplayTypes = [...new Set([...existingTypes, ...openTypes])];
    const totalSelected = categories.length;

    const isGu = locale === "gu";
    return (
        <div>
            {/* <div className="d-flex align-items-center justify-content-between mb-2">
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
            </div> */}

            <div className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                    <div className="btn-group flex-wrap" role="group">
                        {allDisplayTypes.map((type) => {
                            const isOpen = openTypes.includes(type);
                            const countForType = categories.filter(
                                (c) => t(c.type, locale) === type,
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
                                {isGu ? "નવો પ્રકાર" : "New Type"}{" "}
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
                                    <i className="bx bx-plus me-1"></i>{" "}
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const storageUrl = (fileUrl: string | null | undefined) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http") || fileUrl.startsWith("/storage/")) {
        return fileUrl;
    }
    return `/storage/${String(fileUrl).replace(/^\//, "")}`;
};

// ── Main Edit ─────────────────────────────────────────────────────────────────
const PadEdit = ({
    pad,
    categories = [],
}: {
    pad: any;
    categories?: any[];
}) => {
    const page = usePage().props as { locale?: string };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const isGu = locale === "gu";

    const rv = pad?.recorded_version;

    const { data, setData, processing, errors } = useForm({
        title: toTrans(pad?.title),
        value: toTrans(pad?.value),
        status: pad?.status ?? "draft",
        establish_date: pad?.establish_date ?? "",
        categories: (pad?.categories ?? []).map((c: any) => ({
            // id: c.id,
            // type: t(c.type, locale), // string for selector
            // value: t(c.value, locale),
            id: c.id,
            type: c.type,
            value: c.value,
            isCustomValue: false,
        })),
        recorded_version: {
            id: rv?.id ?? null,
            media_type: rv?.media_type ?? "",
            file: null as File | null,
            file_url: rv?.file_url ?? null,
            singer: toTrans(rv?.singer),
            publisher: toTrans(rv?.publisher),
            vocalization: toTrans(rv?.vocalization),
            recording_type: rv?.recording_type ?? "",
        },
        locale,
    });

    // Keep locale in form data when header toggle changes
    useEffect(() => {
        setData("locale", locale);
    }, [locale]);

    const setTranslation = (field: "title" | "value", text: string) => {
        setData(field, {
            ...data[field],
            [locale]: text,
        });
    };

    const updateRecordedVersion = (field: string, value: any) => {
        setData("recorded_version", {
            ...data.recorded_version,
            [field]: value,
        });
    };

    const setRvTranslation = (
        field: "singer" | "publisher" | "vocalization",
        text: string,
    ) => {
        updateRecordedVersion(field, {
            ...data.recorded_version[field],
            [locale]: text,
        });
    };

    const handleSubmit = () => {
        router.post(
            route("admin.pads.update", pad.id),
            {
                ...data,
                locale,
                _method: "put",
            },
            {
                forceFormData: true,
                onSuccess: () => toast.success("Pad updated successfully!"),
                onError: (errs) => {
                    console.log("Validation errors:", errs);
                    toast.error("Please fix the errors below.");
                },
            },
        );
    };

    const currentFileUrl = storageUrl(data.recorded_version?.file_url);
    const displayTitle = t(pad?.title, locale) || "Edit Pad";

    return (
        <React.Fragment>
            <Head title={`Edit Pad | ${displayTitle}`} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Edit Pad" pageTitle="Pads" />

                    <div className="mb-3">
                        <span className="badge bg-primary">
                            Editing in: {isGu ? "ગુજરાતી (GU)" : "English (EN)"}
                        </span>
                        <small className="text-muted ms-2">
                            {isGu
                                ? "બીજી ભાષાનું અનુવાદ ઉમેરવા માટે હેડર ટૉગલમાંથી ભાષા બદલો."
                                : "Switch language from the header toggle to fill the other translation."}
                        </small>
                    </div>

                    <Row>
                        <Col lg={12}>
                            {/* Pad Details */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        {isGu ? "પદની વિગતો" : "Pad Details"}{" "}
                                        {pad?.id && (
                                            <span
                                                className="badge bg-secondary ms-2"
                                                style={{ fontSize: "10px" }}
                                            >
                                                ID #{pad.id}
                                            </span>
                                        )}
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col lg={12}>
                                            <Form.Group>
                                                <Form.Label htmlFor="pad-title">
                                                    {isGu
                                                        ? "પદનું શીર્ષક"
                                                        : "Pad Title"}{" "}
                                                    {/* <span className="text-muted">
                                                        ({isGu ? "GU" : "EN"})
                                                    </span>{" "} */}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="pad-title"
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
                                                <Form.Label htmlFor="pad-value">
                                                    {isGu ? "ગીત" : "Lyrics"}{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    id="pad-value"
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
                                                        ? "સ્થાપના તારીખ:"
                                                        : "Establish Date"}{" "}
                                                </Form.Label>
                                                <Flatpickr
                                                    className="form-control"
                                                    placeholder={
                                                        isGu
                                                            ? "તારીખ પસંદ કરો..."
                                                            : "Select Date"
                                                    }
                                                    value={
                                                        data.establish_date ||
                                                        ""
                                                    }
                                                    options={{
                                                        dateFormat: "Y-m-d",
                                                    }}
                                                    onChange={([
                                                        date,
                                                    ]: Date[]) => {
                                                        const formatted = date
                                                            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                                            : "";
                                                        setData(
                                                            "establish_date",
                                                            formatted,
                                                        );
                                                    }}
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
                                                <Form.Label htmlFor="pad-status">
                                                    {isGu
                                                        ? "સ્ટેટ્સ:"
                                                        : "Status"}{" "}
                                                </Form.Label>
                                                <Form.Select
                                                    id="pad-status"
                                                    value={data.status}
                                                    onChange={(e) =>
                                                        setData(
                                                            "status",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={!!errors.status}
                                                >
                                                    <option value="">
                                                        {isGu
                                                            ? "પસંદ કરો..."
                                                            : "Select…"}{" "}
                                                    </option>
                                                    <option value="save">
                                                        {isGu
                                                            ? "પ્રકાશિત"
                                                            : "Publish"}{" "}
                                                    </option>
                                                    <option value="draft">
                                                        {isGu
                                                            ? "ડ્રાફ્ટ"
                                                            : "Draft"}{" "}
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

                            {/* Categories */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isGu ? "શ્રેણીઓ:" : "Categories"}{" "}
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

                            {/* Recorded Version */}
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isGu
                                            ? "રેકોર્ડ કરેલ સંસ્કરણ"
                                            : "Recorded Version"}{" "}
                                        {data.recorded_version?.id && (
                                            <span
                                                className="badge bg-secondary ms-2"
                                                style={{ fontSize: "10px" }}
                                            >
                                                ID #{data.recorded_version.id}
                                            </span>
                                        )}
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isGu
                                                        ? "ઑડિયો/વિડિયો પ્રકાર:"
                                                        : "Upload Audio / Video"}{" "}
                                                </Form.Label>
                                                <Form.Select
                                                    value={
                                                        data.recorded_version
                                                            ?.media_type ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        updateRecordedVersion(
                                                            "media_type",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        {isGu
                                                            ? "પસંદ કરો..."
                                                            : "Select…"}{" "}
                                                    </option>
                                                    <option value="audio">
                                                        {isGu
                                                            ? "ઑડિયો"
                                                            : "Audio"}{" "}
                                                    </option>
                                                    <option value="video">
                                                        {isGu
                                                            ? "વિડિયો"
                                                            : "Video"}{" "}
                                                    </option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isGu
                                                        ? "લાઈવ / સ્ટુડિયો:"
                                                        : "Live / Studio:"}{" "}
                                                </Form.Label>
                                                <Form.Select
                                                    value={
                                                        data.recorded_version
                                                            ?.recording_type ??
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
                                                        {isGu
                                                            ? "પસંદ કરો..."
                                                            : "Select…"}{" "}
                                                    </option>
                                                    <option value="live">
                                                        {isGu
                                                            ? "લાઈવ"
                                                            : "Live"}{" "}
                                                    </option>
                                                    <option value="studio">
                                                        {isGu
                                                            ? "સ્ટુડિયો"
                                                            : "Studio"}{" "}
                                                    </option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isGu
                                                        ? "ગાયક:"
                                                        : "Singer:"}{" "}
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder={
                                                        isGu
                                                            ? "ગાયકનું નામ"
                                                            : "Singer name"
                                                    }
                                                    value={
                                                        data.recorded_version
                                                            ?.singer?.[
                                                            locale
                                                        ] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setRvTranslation(
                                                            "singer",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isGu
                                                        ? "ઉચ્ચારણ:"
                                                        : "Vocalization:"}{" "}
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder={
                                                        isGu
                                                            ? "સ્વરકાર"
                                                            : "Vocalization"
                                                    }
                                                    value={
                                                        data.recorded_version
                                                            ?.vocalization?.[
                                                            locale
                                                        ] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setRvTranslation(
                                                            "vocalization",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isGu
                                                        ? "પ્રકાશક:"
                                                        : " Publisher:"}{" "}
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder={
                                                        isGu
                                                            ? "પ્રકાશક વિગતો"
                                                            : "Publisher"
                                                    }
                                                    value={
                                                        data.recorded_version
                                                            ?.publisher?.[
                                                            locale
                                                        ] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setRvTranslation(
                                                            "publisher",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isGu
                                                        ? "ફાઈલ:"
                                                        : "File:"}{" "}
                                                </Form.Label>
                                                {currentFileUrl && (
                                                    <div className="mb-2">
                                                        {data.recorded_version
                                                            ?.media_type ===
                                                        "video" ? (
                                                            <video
                                                                controls
                                                                src={
                                                                    currentFileUrl
                                                                }
                                                                className="w-100 rounded"
                                                                style={{
                                                                    maxHeight: 240,
                                                                }}
                                                            />
                                                        ) : (
                                                            <audio
                                                                controls
                                                                src={
                                                                    currentFileUrl
                                                                }
                                                                className="w-100"
                                                                style={{
                                                                    maxHeight: 40,
                                                                }}
                                                            >
                                                                Your browser
                                                                does not support
                                                                the audio
                                                                element.
                                                            </audio>
                                                        )}
                                                        <div className="mt-1">
                                                            <a
                                                                href={
                                                                    currentFileUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="small"
                                                            >
                                                                Open current
                                                                file
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                                <Form.Control
                                                    type="file"
                                                    accept="audio/*,video/*"
                                                    onChange={(e) =>
                                                        updateRecordedVersion(
                                                            "file",
                                                            e.target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                />
                                                {data.recorded_version
                                                    ?.file && (
                                                    <small className="text-success d-block mt-1">
                                                        New file:{" "}
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
                                    className="btn btn-success w-sm"
                                    disabled={processing}
                                    onClick={handleSubmit}
                                >
                                    {processing
                                        ? isGu
                                            ? "સેવ થઈ રહ્યુ છે"
                                            : "Saving..."
                                        : isGu
                                          ? "ફેરફાર કરો."
                                          : "Update Pad"}
                                </button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

PadEdit.layout = (page: any) => <Layout children={page} />;
export default PadEdit;
