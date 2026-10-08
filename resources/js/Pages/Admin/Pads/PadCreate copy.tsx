import React, { useEffect, useMemo, useState } from "react";

import { Card, Col, Container, Form, Row, Button } from "react-bootstrap";

import { Head, Link, router, useForm, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import Layout from "../../../Layouts";

import { toast } from "react-toastify";

import Flatpickr from "react-flatpickr";

import Select from "react-select";

import makeAnimated from "react-select/animated";

import { usePermission } from "../../../hooks/usePermission";

const animatedComponents = makeAnimated();

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic multilingual value helper
// ─────────────────────────────────────────────────────────────────────────────

const tValue = (value: any, locale: string): string => {
    if (value == null) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        return value[locale] ?? Object.values(value)[0] ?? "";
    }

    return String(value);
};

// ─────────────────────────────────────────────────────────────────────────────
// Central translation helper
// ─────────────────────────────────────────────────────────────────────────────

const createTranslator = (translations: Record<string, any>) => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ): string => {
        let text = translations[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });

        return text;
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Create empty multilingual object from DB languages
// ─────────────────────────────────────────────────────────────────────────────

const createLanguageValues = (languages: any[]): Record<string, string> => {
    return languages.reduce((values: Record<string, string>, language: any) => {
        values[language.code] = "";

        return values;
    }, {});
};

// ─────────────────────────────────────────────────────────────────────────────
// Category Selector
// ─────────────────────────────────────────────────────────────────────────────

const CategorySelector = ({
    categories = [],
    onChange,
    allCategories = [],
    locale = "gu",
}: {
    categories: any[];
    onChange: (cats: any[]) => void;
    allCategories: any[];
    locale: string;
}) => {
    const page = usePage().props as any;

    const { translations = {} } = page;

    const tr = useMemo(() => createTranslator(translations), [translations]);

    // ─────────────────────────────────────────────────────────────────────
    // Group categories by translated type
    // ─────────────────────────────────────────────────────────────────────

    const grouped = useMemo(() => {
        return allCategories.reduce((acc: any, category: any) => {
            const type = tValue(category.type, locale);

            const value = tValue(category.value, locale);

            if (!type) {
                return acc;
            }

            if (!acc[type]) {
                acc[type] = [];
            }

            acc[type].push({
                id: category.id,
                value,
            });

            return acc;
        }, {});
    }, [allCategories, locale]);

    const existingTypes = Object.keys(grouped);

    const [openTypes, setOpenTypes] = useState<string[]>([]);

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

    // ─────────────────────────────────────────────────────────────────────
    // Options
    // ─────────────────────────────────────────────────────────────────────

    const getOptions = (type: string) => {
        const dbValues = (grouped[type] || []).map((item: any) => ({
            value: item.value,
            label: item.value,
        }));

        const customValues = (extraOptions[type] || []).map((value) => ({
            value,
            label: value,
        }));

        return [...dbValues, ...customValues];
    };

    // ─────────────────────────────────────────────────────────────────────
    // Selected values
    // ─────────────────────────────────────────────────────────────────────

    const getSelected = (type: string) =>
        categories
            .filter((category) => tValue(category.type, locale) === type)
            .map((category) => {
                const value = tValue(category.value, locale);

                return {
                    value,
                    label: value,
                };
            });

    // ─────────────────────────────────────────────────────────────────────
    // Select change
    // ─────────────────────────────────────────────────────────────────────

    const handleSelectChange = (type: string, selectedOptions: any) => {
        const others = categories.filter(
            (category) => tValue(category.type, locale) !== type,
        );

        const dbValues = (grouped[type] || []).map((item: any) => item.value);

        const newItems = (selectedOptions || []).map((option: any) => ({
            type,
            value: option.value,
            isCustomValue: !dbValues.includes(option.value),
        }));

        onChange([...others, ...newItems]);
    };

    // ─────────────────────────────────────────────────────────────────────
    // Add custom value
    // ─────────────────────────────────────────────────────────────────────

    const handleAddCustomValue = (type: string) => {
        const value = (newValueInput[type] || "").trim();

        if (!value) {
            return;
        }

        setExtraOptions((prev) => ({
            ...prev,
            [type]: [...(prev[type] || []), value],
        }));

        const others = categories.filter(
            (category) => tValue(category.type, locale) !== type,
        );

        const current = categories.filter(
            (category) => tValue(category.type, locale) === type,
        );

        if (
            !current.some(
                (category) => tValue(category.value, locale) === value,
            )
        ) {
            onChange([
                ...others,
                ...current,
                {
                    type,
                    value,
                    isCustomValue: true,
                },
            ]);
        }

        setNewValueInput((prev) => ({
            ...prev,
            [type]: "",
        }));

        setShowAddValue((prev) => ({
            ...prev,
            [type]: false,
        }));
    };

    // ─────────────────────────────────────────────────────────────────────
    // Activate type
    // ─────────────────────────────────────────────────────────────────────

    const activateType = (type: string) => {
        if (!openTypes.includes(type)) {
            setOpenTypes((prev) => [...prev, type]);
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // Close type
    // ─────────────────────────────────────────────────────────────────────

    const closeType = (type: string) => {
        setOpenTypes((prev) => prev.filter((item) => item !== type));

        onChange(
            categories.filter(
                (category) => tValue(category.type, locale) !== type,
            ),
        );

        setShowAddValue((prev) => ({
            ...prev,
            [type]: false,
        }));

        setNewValueInput((prev) => ({
            ...prev,
            [type]: "",
        }));
    };

    // ─────────────────────────────────────────────────────────────────────
    // Add custom type
    // ─────────────────────────────────────────────────────────────────────

    const handleAddCustomType = () => {
        const text = customTypeText.trim();

        if (!text) {
            return;
        }

        activateType(text);

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
                    style={{
                        fontSize: "13px",
                    }}
                >
                    {tr("categories")}
                </Form.Label>

                {/* {totalSelected > 0 && (
                    <span
                        className="badge bg-success"
                        style={{
                            fontSize: "10px",
                        }}
                    >
                        {tr("selected_count", {
                            count: totalSelected,
                        })}
                    </span>
                )} */}
            </div>

            <div className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                    <div className="btn-group flex-wrap" role="group">
                        {allDisplayTypes.map((type) => {
                            const isOpen = openTypes.includes(type);

                            const countForType = categories.filter(
                                (category) =>
                                    tValue(category.type, locale) === type,
                            ).length;

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    className={`btn btn-sm ${
                                        isOpen
                                            ? "btn-success"
                                            : "btn-outline-dark"
                                    }`}
                                    onClick={() =>
                                        isOpen
                                            ? closeType(type)
                                            : activateType(type)
                                    }
                                >
                                    {type}

                                    {countForType > 0 && (
                                        <span
                                            className={`badge ms-1 ${
                                                isOpen
                                                    ? "bg-light text-dark"
                                                    : "bg-primary text-white"
                                            }`}
                                            style={{
                                                fontSize: "10px",
                                            }}
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
                                <i className="bx bx-plus me-1" />

                                {tr("new_type")}
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
                                placeholder={tr("type_name")}
                                value={customTypeText}
                                style={{
                                    width: "130px",
                                }}
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
                                {tr("add")}
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                    setShowCustomTypeInput(false);

                                    setCustomTypeText("");
                                }}
                            >
                                <i className="bx bx-x" />
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
                    <div key={type} className="border rounded p-2 mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <label>{type}</label>

                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                style={{
                                    fontSize: "11px",
                                }}
                                onClick={() => closeType(type)}
                            >
                                <i className="bx bx-trash me-1" />

                                {tr("close")}
                            </button>
                        </div>

                        <Select
                            isMulti
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            options={options}
                            value={selected}
                            onChange={(selectedOptions) =>
                                handleSelectChange(type, selectedOptions)
                            }
                            placeholder={
                                options.length === 0
                                    ? tr("no_existing_values")
                                    : tr("select_values", {
                                          type,
                                      })
                            }
                            noOptionsMessage={() => tr("no_values_found")}
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    fontSize: "13px",
                                    minHeight: "36px",
                                    backgroundColor:
                                        document.documentElement.getAttribute(
                                            "data-bs-theme",
                                        ) === "dark"
                                            ? "#212529"
                                            : "#fff",
                                    borderColor: state.isFocused
                                        ? "#0d6efd"
                                        : "#ced4da",
                                    color:
                                        document.documentElement.getAttribute(
                                            "data-bs-theme",
                                        ) === "dark"
                                            ? "#fff"
                                            : "#212529",
                                }),

                                menu: (base) => ({
                                    ...base,
                                    fontSize: "13px",
                                    zIndex: 9999,
                                    backgroundColor:
                                        document.documentElement.getAttribute(
                                            "data-bs-theme",
                                        ) === "dark"
                                            ? "#212529"
                                            : "#fff",
                                    color:
                                        document.documentElement.getAttribute(
                                            "data-bs-theme",
                                        ) === "dark"
                                            ? "#fff"
                                            : "#212529",
                                }),

                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused
                                        ? "#0d6efd"
                                        : "transparent",
                                    color: state.isFocused ? "#fff" : "inherit",
                                    cursor: "pointer",
                                }),

                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: "#e7f3ff",
                                }),

                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: "#0d6efd",
                                }),

                                input: (base) => ({
                                    ...base,
                                    color: "inherit",
                                }),

                                singleValue: (base) => ({
                                    ...base,
                                    color: "inherit",
                                }),
                            }}
                        />

                        <div className="mt-2">
                            {!isAddingValue ? (
                                <button
                                    type="button"
                                    className="btn btn-link btn-sm p-0 text-success"
                                    style={{
                                        fontSize: "12px",
                                    }}
                                    onClick={() =>
                                        setShowAddValue((prev) => ({
                                            ...prev,
                                            [type]: true,
                                        }))
                                    }
                                >
                                    <i className="bx bx-plus me-1" />

                                    {tr("add_new_value")}
                                </button>
                            ) : (
                                <div className="d-flex gap-2 align-items-center">
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        autoFocus
                                        placeholder={tr(
                                            "new_value_placeholder",
                                            {
                                                type,
                                            },
                                        )}
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
                                        style={{
                                            whiteSpace: "nowrap",
                                        }}
                                        disabled={
                                            !(newValueInput[type] || "").trim()
                                        }
                                        onClick={() =>
                                            handleAddCustomValue(type)
                                        }
                                    >
                                        {tr("add")}
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
                                        <i className="bx bx-x" />
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

// ─────────────────────────────────────────────────────────────────────────────
// Empty recorded version
// ─────────────────────────────────────────────────────────────────────────────

const emptyRecordedVersion = (languages: any[]) => ({
    file: null as File | null,

    singer: createLanguageValues(languages),

    publisher: createLanguageValues(languages),

    vocalization: createLanguageValues(languages),

    raga: createLanguageValues(languages),

    recording_type: "",

    media_type: "",
});

// ─────────────────────────────────────────────────────────────────────────────
// Pad Create
// ─────────────────────────────────────────────────────────────────────────────

const PadCreate = ({ categories = [] }: { categories?: any[] }) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale, languages = [] } = page;

    // ─────────────────────────────────────────────────────────────────────
    // Current locale
    // ─────────────────────────────────────────────────────────────────────

    const currentLocale = locale || "gu";

    // ─────────────────────────────────────────────────────────────────────
    // Central translator
    // ─────────────────────────────────────────────────────────────────────

    const tr = useMemo(() => createTranslator(translations), [translations]);

    // ─────────────────────────────────────────────────────────────────────
    // Dynamic role prefix
    // ─────────────────────────────────────────────────────────────────────

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    // ─────────────────────────────────────────────────────────────────────
    // Permission
    // ─────────────────────────────────────────────────────────────────────

    const { can } = usePermission();

    const canCreate = can("pads", "create");

    // ─────────────────────────────────────────────────────────────────────
    // Initial multilingual values
    // ─────────────────────────────────────────────────────────────────────

    const initialTitle = useMemo(
        () => createLanguageValues(languages),
        [languages],
    );

    const initialValue = useMemo(
        () => createLanguageValues(languages),
        [languages],
    );

    const initialRecordedVersion = useMemo(
        () => emptyRecordedVersion(languages),
        [languages],
    );

    // ─────────────────────────────────────────────────────────────────────
    // Form
    // IMPORTANT: useForm must be called before conditional return
    // ─────────────────────────────────────────────────────────────────────

    const { data, setData, post, processing, errors, reset } = useForm({
        title: initialTitle,

        value: initialValue,

        status: "draft",

        establish_date: "",

        categories: [] as any[],

        recorded_versions: [initialRecordedVersion],

        locale: currentLocale,
    });

    // ─────────────────────────────────────────────────────────────────────
    // Permission redirect
    // ─────────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!canCreate) {
            toast.error(tr("no_permission_create_pad"));

            router.visit(
                route("role.pads.list", {
                    rolePrefix,
                }),
            );
        }
    }, [canCreate, rolePrefix, tr]);

    // ─────────────────────────────────────────────────────────────────────
    // Keep form locale synchronized
    // ─────────────────────────────────────────────────────────────────────

    useEffect(() => {
        setData("locale", currentLocale);
    }, [currentLocale]);

    // ─────────────────────────────────────────────────────────────────────
    // Recorded version update
    // ─────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────
    // Recorded version translation
    // ─────────────────────────────────────────────────────────────────────

    const setRvTranslation = (
        index: number,
        field: "singer" | "publisher" | "vocalization" | "raga",
        text: string,
    ) => {
        const updated = [...data.recorded_versions];

        updated[index] = {
            ...updated[index],

            [field]: {
                ...updated[index][field],
                [currentLocale]: text,
            },
        };

        setData("recorded_versions", updated);
    };

    // ─────────────────────────────────────────────────────────────────────
    // Add recorded version
    // ─────────────────────────────────────────────────────────────────────

    const addRecordedVersion = () => {
        setData("recorded_versions", [
            ...data.recorded_versions,
            emptyRecordedVersion(languages),
        ]);
    };

    // ─────────────────────────────────────────────────────────────────────
    // Remove recorded version
    // ─────────────────────────────────────────────────────────────────────

    const removeRecordedVersion = (index: number) => {
        if (data.recorded_versions.length <= 1) {
            return;
        }

        const updated = data.recorded_versions.filter(
            (_item: any, i: number) => i !== index,
        );

        setData("recorded_versions", updated);
    };

    // ─────────────────────────────────────────────────────────────────────
    // Main title/value translation
    // ─────────────────────────────────────────────────────────────────────

    const setTranslation = (field: "title" | "value", text: string) => {
        setData(field, {
            ...data[field],
            [currentLocale]: text,
        });
    };

    // ─────────────────────────────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────────────────────────────

    const handleSubmit = (submitStatus: string) => {
        setData("status", submitStatus);

        setData("locale", currentLocale);

        setTimeout(() => {
            post(
                route("role.pads.store", {
                    rolePrefix,
                }),
                {
                    forceFormData: true,

                    onSuccess: () => {
                        // toast.success(tr("pad_created_success"));
                        reset();
                    },

                    onError: () => {
                        // toast.error(tr("please_fix_errors"));
                    },
                },
            );
        }, 50);
    };

    // ─────────────────────────────────────────────────────────────────────
    // Permission guard
    // ─────────────────────────────────────────────────────────────────────

    if (!canCreate) {
        return null;
    }

    return (
        <React.Fragment>
            <Head title={tr("add_pad")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={tr("add_pad")} pageTitle={tr("pads")} />

                    <Row>
                        <Col lg={12}>
                            {/* ── Pad Details ─────────────────────────────── */}

                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {tr("pad_details")}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Row className="g-3">
                                        {/* Title */}

                                        <Col lg={12}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {tr("pad_title")}{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>

                                                <Form.Control
                                                    type="text"
                                                    placeholder={tr(
                                                        "title_placeholder",
                                                    )}
                                                    value={
                                                        data.title?.[
                                                            currentLocale
                                                        ] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setTranslation(
                                                            "title",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors[
                                                            `title.${currentLocale}`
                                                        ] || !!errors.title
                                                    }
                                                />

                                                <Form.Control.Feedback type="invalid">
                                                    {errors[
                                                        `title.${currentLocale}`
                                                    ] || errors.title}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        {/* Lyrics */}

                                        <Col lg={12}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {tr("lyrics")}{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>

                                                <Form.Control
                                                    as="textarea"
                                                    rows={6}
                                                    placeholder={tr(
                                                        "lyrics_placeholder",
                                                    )}
                                                    value={
                                                        data.value?.[
                                                            currentLocale
                                                        ] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setTranslation(
                                                            "value",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors[
                                                            `value.${currentLocale}`
                                                        ] || !!errors.value
                                                    }
                                                />

                                                <Form.Control.Feedback type="invalid">
                                                    {errors[
                                                        `value.${currentLocale}`
                                                    ] || errors.value}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        {/* Establish Date */}

                                        <Col lg={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {tr("establish_date")}
                                                </Form.Label>

                                                <Flatpickr
                                                    value={
                                                        data.establish_date ||
                                                        ""
                                                    }
                                                    className="form-control"
                                                    placeholder={tr(
                                                        "select_date",
                                                    )}
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

                                        {/* Status */}

                                        <Col lg={6}>
                                            <Form.Group>
                                                <Form.Label className="d-block">
                                                    {tr("status")}
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
                                                            ? tr("published")
                                                            : tr("draft")}
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
                                        {tr("categories")}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <CategorySelector
                                        categories={data.categories ?? []}
                                        allCategories={categories}
                                        locale={currentLocale}
                                        onChange={(cats) =>
                                            setData("categories", cats)
                                        }
                                    />
                                </Card.Body>
                            </Card>

                            {/* ── Recorded Versions ───────────────────────── */}

                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        {tr("recorded_versions")}
                                    </h5>

                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        type="button"
                                        onClick={addRecordedVersion}
                                    >
                                        <i className="bx bx-plus me-1" />

                                        {tr("add_another_version")}
                                    </Button>
                                </Card.Header>

                                <Card.Body>
                                    {data.recorded_versions.map(
                                        (rv: any, index: number) => (
                                            <div
                                                key={index}
                                                className="border rounded p-3 mb-3"
                                            >
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <strong>
                                                        {tr("version", {
                                                            number: index + 1,
                                                        })}
                                                    </strong>

                                                    {data.recorded_versions
                                                        .length > 1 && (
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
                                                            <i className="bx bx-trash me-1" />

                                                            {tr("remove")}
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
                                                                {tr(
                                                                    "upload_audio_video",
                                                                )}
                                                            </Form.Label>

                                                            <Form.Control
                                                                type="file"
                                                                accept="audio/*,video/*"
                                                                onChange={(
                                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                                ) =>
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
                                                                    {tr(
                                                                        "selected_file",
                                                                        {
                                                                            name: rv
                                                                                .file
                                                                                .name,
                                                                        },
                                                                    )}
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
                                                                {tr("singer")}
                                                            </Form.Label>

                                                            <Form.Control
                                                                type="text"
                                                                placeholder={tr(
                                                                    "singer_placeholder",
                                                                )}
                                                                value={
                                                                    rv.singer?.[
                                                                        currentLocale
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
                                                                {tr(
                                                                    "vocalization",
                                                                )}
                                                            </Form.Label>

                                                            <Form.Control
                                                                type="text"
                                                                placeholder={tr(
                                                                    "vocalization_placeholder",
                                                                )}
                                                                value={
                                                                    rv
                                                                        .vocalization?.[
                                                                        currentLocale
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

                                                    {/* Raga */}

                                                    <Col lg={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            >
                                                                {tr("raga")}
                                                            </Form.Label>

                                                            <Form.Control
                                                                type="text"
                                                                placeholder={tr(
                                                                    "raga_placeholder",
                                                                )}
                                                                value={
                                                                    rv.raga?.[
                                                                        currentLocale
                                                                    ] ?? ""
                                                                }
                                                                onChange={(e) =>
                                                                    setRvTranslation(
                                                                        index,
                                                                        "raga",
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
                                                                {tr(
                                                                    "publisher",
                                                                )}
                                                            </Form.Label>

                                                            <Form.Control
                                                                as="textarea"
                                                                rows={2}
                                                                placeholder={tr(
                                                                    "publisher_placeholder",
                                                                )}
                                                                value={
                                                                    rv
                                                                        .publisher?.[
                                                                        currentLocale
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

                                                    {/* Recording Type */}

                                                    <Col lg={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            >
                                                                {tr(
                                                                    "live_studio",
                                                                )}
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
                                                                    {tr(
                                                                        "select",
                                                                    )}
                                                                </option>

                                                                <option value="live">
                                                                    {tr("live")}
                                                                </option>

                                                                <option value="studio">
                                                                    {tr(
                                                                        "studio",
                                                                    )}
                                                                </option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>

                                                    {/* Media Type */}

                                                    <Col lg={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            >
                                                                {tr(
                                                                    "audio_video",
                                                                )}
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
                                                                    {tr(
                                                                        "select",
                                                                    )}
                                                                </option>

                                                                <option value="audio">
                                                                    {tr(
                                                                        "audio",
                                                                    )}
                                                                </option>

                                                                <option value="video">
                                                                    {tr(
                                                                        "video",
                                                                    )}
                                                                </option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ),
                                    )}
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
                                    {tr("cancel")}
                                </Link>

                                <button
                                    type="button"
                                    className="btn btn-success w-sm"
                                    disabled={processing}
                                    onClick={() => handleSubmit("save")}
                                >
                                    {processing ? tr("saving") : tr("save_pad")}
                                </button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

PadCreate.layout = (page: any) => <Layout children={page} />;

export default PadCreate;
