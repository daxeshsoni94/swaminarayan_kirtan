import React, { useEffect, useMemo, useState } from "react";

import {
    Card,
    Col,
    Container,
    Form,
    Row,
    Button,
    Modal,
} from "react-bootstrap";

import { Head, Link, router, useForm, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import Layout from "../../../Layouts";

import { toast } from "react-toastify";

import Flatpickr from "react-flatpickr";

import Select from "react-select";

import makeAnimated from "react-select/animated";

import { usePermission } from "../../../hooks/usePermission";
import { gujaratiNumber } from "../../../utils/number";
import { GujaratiLocale, updateYearToGujarati } from "../../../utils/flatpickrLocales";

const animatedComponents = makeAnimated();

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic multilingual value helper
// ─────────────────────────────────────────────────────────────────────────────

// const tValue = (value: any, locale: string): string => {
//     if (value == null) {
//         return "";
//     }

//     if (typeof value === "string") {
//         return value;
//     }

//     if (typeof value === "object") {
//         return value[locale] ?? Object.values(value)[0] ?? "";
//     }

//     return String(value);
// };

const tValue = (value: any, locale: string): string => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        // ONLY current locale – no fallback
        const text = value[locale];
        return typeof text === "string" ? text : "";
    }
    return String(value);
};
const matchesAnyLocale = (value: any, input: string): boolean => {
    if (!input) return true;
    const q = input.toLowerCase().trim();

    if (typeof value === "string") {
        return value.toLowerCase().includes(q);
    }

    if (typeof value === "object" && value !== null) {
        return Object.values(value).some(
            (v) => typeof v === "string" && v.toLowerCase().includes(q),
        );
    }

    return false;
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
    languages = [],
}: {
    categories: any[];
    onChange: (cats: any[]) => void;
    allCategories: any[];
    locale: string;
    languages: any[];
}) => {
    const page = usePage().props as any;

    const { translations = {} } = page;

    const tr = useMemo(() => createTranslator(translations), [translations]);

    // ─────────────────────────────────────────────────────────────────────
    // Group categories by translated type
    // ─────────────────────────────────────────────────────────────────────

    // const grouped = useMemo(() => {
    //     return allCategories.reduce((acc: any, category: any) => {
    //         const type = tValue(category.type, locale);

    //         const value = tValue(category.value, locale);

    //         if (!type) {
    //             return acc;
    //         }

    //         if (!acc[type]) {
    //             acc[type] = [];
    //         }

    //         acc[type].push({
    //             id: category.id,
    //             value,
    //         });

    //         return acc;
    //     }, {});
    // }, [allCategories, locale]);
    const grouped = useMemo(() => {
        return allCategories.reduce((acc: any, category: any) => {
            const typeLabel = tValue(category.type, locale);
            if (!typeLabel) return acc;

            if (!acc[typeLabel]) acc[typeLabel] = [];

            const valueLabel = tValue(category.value, locale);
            // only show if current locale has a value
            if (!valueLabel) return acc;

            acc[typeLabel].push({
                id: category.id,
                typeRaw: category.type, // full { en, gu, ... }
                valueRaw: category.value, // full { en, gu, ... }
                value: valueLabel, // display label (Gujarati when locale=gu)
            });

            return acc;
        }, {});
    }, [allCategories, locale]);
    const existingTypes = Object.keys(grouped);

    const [openTypes, setOpenTypes] = useState<string[]>([]);

    const [showAddValue, setShowAddValue] = useState<Record<string, boolean>>(
        {},
    );

    const [newValueInput, setNewValueInput] = useState<
        Record<string, Record<string, string>>
    >({});

    const [extraOptions, setExtraOptions] = useState<
        Record<string, Record<string, string>[]>
    >({});

    const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);

    const [customTypeInput, setCustomTypeInput] = useState<
        Record<string, string>
    >({});
    const [customTypeRaw, setCustomTypeRaw] = useState<
        Record<string, Record<string, string>>
    >({});

    // ─────────────────────────────────────────────────────────────────────
    // Options
    // ─────────────────────────────────────────────────────────────────────

    // const getOptions = (type: string) => {
    //     const dbValues = (grouped[type] || []).map((item: any) => ({
    //         value: item.value,
    //         label: item.value,
    //     }));

    //     const customValues = (extraOptions[type] || []).map((value) => ({
    //         value,
    //         label: value,
    //     }));

    //     return [...dbValues, ...customValues];
    // };

    const getOptions = (type: string) => {
        const dbValues = (grouped[type] || []).map((item: any) => ({
            value: item.value,
            label: item.value,
            id: item.id,
            typeRaw: item.typeRaw,
            valueRaw: item.valueRaw,
        }));

        const customValues = (extraOptions[type] || []).map((valObj) => ({
            value: valObj[locale] || Object.values(valObj)[0] || "",
            label: valObj[locale] || Object.values(valObj)[0] || "",
            isCustom: true,
            valueRaw: valObj,
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

        const newItems = (selectedOptions || []).map((option: any) => {
            // Existing DB category → keep full translation maps
            if (option.id && option.valueRaw) {
                return {
                    id: option.id,
                    type: option.typeRaw,
                    value: option.valueRaw,
                    isCustomValue: false,
                };
            }

            // Brand-new custom value → current locale only
            return {
                type: customTypeRaw[type] || type,
                value: option.valueRaw || { [locale]: option.value },
                isCustomValue: true,
            };
        });

        onChange([...others, ...newItems]);
    };

    // ─────────────────────────────────────────────────────────────────────
    // Add custom value
    // ─────────────────────────────────────────────────────────────────────

    const handleAddCustomValue = (type: string) => {
        const valObj = newValueInput[type] || {};

        if (languages.some((lang: any) => !(valObj[lang.code] || "").trim())) {
            return;
        }

        const primaryValue = valObj[locale] || Object.values(valObj)[0];

        if (!primaryValue) {
            return;
        }

        setExtraOptions((prev) => ({
            ...prev,
            [type]: [...(prev[type] || []), { ...valObj }],
        }));

        const others = categories.filter(
            (category) => tValue(category.type, locale) !== type,
        );

        const current = categories.filter(
            (category) => tValue(category.type, locale) === type,
        );

        if (
            !current.some(
                (category) => tValue(category.value, locale) === primaryValue,
            )
        ) {
            onChange([
                ...others,
                ...current,
                {
                    type: customTypeRaw[type] || type,
                    value: { ...valObj },
                    isCustomValue: true,
                },
            ]);
        }

        setNewValueInput((prev) => ({
            ...prev,
            [type]: {},
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
            [type]: {},
        }));
    };

    // ─────────────────────────────────────────────────────────────────────
    // Add custom type
    // ─────────────────────────────────────────────────────────────────────

    const handleAddCustomType = () => {
        if (
            languages.some(
                (lang: any) => !(customTypeInput[lang.code] || "").trim(),
            )
        ) {
            return;
        }

        const primaryText = customTypeInput[locale]?.trim();

        if (!primaryText) {
            return;
        }

        setCustomTypeRaw((prev) => ({
            ...prev,
            [primaryText]: { ...customTypeInput },
        }));
        activateType(primaryText);

        setCustomTypeInput({});

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
                            <div className="d-flex align-items-center gap-1 bg-light p-1 rounded border me-2">
                                {languages.map((lang: any) => (
                                    <Form.Control
                                        key={lang.code}
                                        type="text"
                                        size="sm"
                                        placeholder={`${tr("type_name")} (${lang.code.toUpperCase()})`}
                                        value={customTypeInput[lang.code] || ""}
                                        style={{
                                            width: "130px",
                                        }}
                                        onChange={(e) =>
                                            setCustomTypeInput((prev) => ({
                                                ...prev,
                                                [lang.code]: e.target.value,
                                            }))
                                        }
                                    />
                                ))}
                            </div>

                            <button
                                type="button"
                                className="btn btn-warning btn-sm"
                                disabled={languages.some(
                                    (lang: any) =>
                                        !(
                                            customTypeInput[lang.code] || ""
                                        ).trim(),
                                )}
                                onClick={handleAddCustomType}
                            >
                                {tr("add")}
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                    setShowCustomTypeInput(false);

                                    setCustomTypeInput({});
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
                            filterOption={(option, input) => {
                                if (!input) return true;

                                const q = input.toLowerCase();

                                // Match displayed label (Gujarati when UI is Gujarati)
                                if (option.label?.toLowerCase().includes(q)) {
                                    return true;
                                }

                                // Match ANY language (so typing "Bhavnagar" finds ભાવનગર)
                                return (
                                    matchesAnyLocale(
                                        option.data?.valueRaw,
                                        input,
                                    ) ||
                                    matchesAnyLocale(
                                        option.data?.typeRaw,
                                        input,
                                    )
                                );
                            }}
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
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }),

                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: "#e7f3ff",
                                    maxWidth: "100%",
                                }),

                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: "#0d6efd",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
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
                                    <div className="d-flex align-items-center gap-1 bg-light p-1 rounded border">
                                        {languages.map((lang: any) => (
                                            <Form.Control
                                                key={lang.code}
                                                type="text"
                                                size="sm"
                                                placeholder={`${tr("new_value_placeholder", { type })} (${lang.code.toUpperCase()})`}
                                                value={
                                                    (newValueInput[type] || {})[
                                                        lang.code
                                                    ] || ""
                                                }
                                                style={{ width: "130px" }}
                                                onChange={(e) =>
                                                    setNewValueInput(
                                                        (prev) => ({
                                                            ...prev,
                                                            [type]: {
                                                                ...(prev[
                                                                    type
                                                                ] || {}),
                                                                [lang.code]:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        }),
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        style={{
                                            whiteSpace: "nowrap",
                                        }}
                                        disabled={languages.some(
                                            (lang: any) =>
                                                !(
                                                    (newValueInput[type] || {})[
                                                        lang.code
                                                    ] || ""
                                                ).trim(),
                                        )}
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
                                                [type]: {},
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

    media_type: "",

    file_url: "",
    youtube_url: "",

    file_name: createLanguageValues(languages),

    singer: createLanguageValues(languages),

    publisher: createLanguageValues(languages),

    vocalization: createLanguageValues(languages),

    raga: createLanguageValues(languages),

    recording_type: "",
});

// ─────────────────────────────────────────────────────────────────────────────
// Pad Create
// ─────────────────────────────────────────────────────────────────────────────

const getCleanFileName = (fileUrlOrName: string | null | undefined): string => {
    if (!fileUrlOrName) return "";

    try {
        let fullName = fileUrlOrName;
        // If it looks like a path/URL, extract just the filename
        if (fullName.includes('/')) {
            fullName = decodeURIComponent(
                new URL(
                    fullName.startsWith("http") || fullName.startsWith("/")
                        ? fullName
                        : `/storage/${fullName}`,
                    window.location.origin,
                ).pathname
                    .split("/")
                    .pop() || "",
            );
        }

        // 1. Remove Laravel uniqid prefix (13 hex chars + underscore)
        fullName = fullName.replace(/^[a-f0-9]{13}_/, '');
        // 2. Remove any leading digits, underscores, spaces, or dashes (e.g. 1468630441_04 )
        fullName = fullName.replace(/^[\d_]+(?:[ \-]+)?/, '');

        return fullName;
    } catch {
        return "";
    }
};

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

    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    const { data, setData, post, processing, progress, errors, reset } =
        useForm({
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
        field: "file_name" | "singer" | "publisher" | "vocalization" | "raga",
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
                                                        formatDate: (date, formatStr, locale) => {
                                                            const y = date.getFullYear();
                                                            const m = String(date.getMonth() + 1).padStart(2, "0");
                                                            const d = String(date.getDate()).padStart(2, "0");
                                                            const formatted = `${y}-${m}-${d}`;
                                                            return currentLocale === "gu" ? gujaratiNumber(formatted, "gu") : formatted;
                                                        },
                                                        locale: currentLocale === "gu" ? GujaratiLocale : "en",
                                                        onDayCreate: (dObj, dStr, fp, dayElem) => {
                                                            if (currentLocale === "gu") {
                                                                dayElem.innerHTML = gujaratiNumber(dayElem.innerHTML, "gu");
                                                            }
                                                        },
                                                        onReady: (dObj, dStr, fp) => updateYearToGujarati(fp, currentLocale),
                                                        onOpen: (dObj, dStr, fp) => updateYearToGujarati(fp, currentLocale),
                                                        onValueUpdate: (dObj, dStr, fp) => updateYearToGujarati(fp, currentLocale),
                                                        onYearChange: (dObj, dStr, fp) => updateYearToGujarati(fp, currentLocale),
                                                        onMonthChange: (dObj, dStr, fp) => updateYearToGujarati(fp, currentLocale),
                                                    }}
                                                    onChange={([date]: Date[]) => {
                                                        if (date) {
                                                            const y = date.getFullYear();
                                                            const m = String(date.getMonth() + 1).padStart(2, "0");
                                                            const d = String(date.getDate()).padStart(2, "0");
                                                            setData("establish_date", `${y}-${m}-${d}`);
                                                        } else {
                                                            setData("establish_date", "");
                                                        }
                                                    }}
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
                                        languages={languages}
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
                                                            number: gujaratiNumber(
                                                                index + 1,
                                                                locale,
                                                            ),
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

                                                    <Col lg={12}>
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

                                                    {/* File Name */}
                                                    <Col lg={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            >
                                                                {tr(
                                                                    "file_name",
                                                                ) ||
                                                                    "File Name"}
                                                            </Form.Label>

                                                            <Form.Control
                                                                type="text"
                                                                placeholder={
                                                                    tr(
                                                                        "file_name_placeholder",
                                                                    ) ||
                                                                    "Enter file name"
                                                                }
                                                                value={
                                                                    rv
                                                                        .file_name?.[
                                                                        currentLocale
                                                                    ] ?? ""
                                                                }
                                                                onChange={(e) =>
                                                                    setRvTranslation(
                                                                        index,
                                                                        "file_name",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            {errors[
                                                                `recorded_versions.${index}.file_name.${currentLocale}`
                                                            ] && (
                                                                <Form.Control.Feedback
                                                                    type="invalid"
                                                                    className="d-block"
                                                                >
                                                                    {tr(
                                                                        errors[
                                                                            `recorded_versions.${index}.file_name.${currentLocale}`
                                                                        ],
                                                                    )}
                                                                </Form.Control.Feedback>
                                                            )}
                                                        </Form.Group>
                                                    </Col>

                                                    {/* YouTube URL */}
                                                    <Col lg={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            >
                                                                {tr(
                                                                    "youtube_url",
                                                                ) ||
                                                                    "YouTube Link"}
                                                            </Form.Label>

                                                            <Form.Control
                                                                type="text"
                                                                placeholder={
                                                                    tr(
                                                                        "youtube_url_placeholder",
                                                                    ) ||
                                                                    "Enter YouTube URL"
                                                                }
                                                                value={
                                                                    rv.youtube_url ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    updateRecordedVersion(
                                                                        index,
                                                                        "youtube_url",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            {errors[
                                                                `recorded_versions.${index}.youtube_url`
                                                            ] && (
                                                                <Form.Control.Feedback
                                                                    type="invalid"
                                                                    className="d-block"
                                                                >
                                                                    {
                                                                        errors[
                                                                            `recorded_versions.${index}.youtube_url`
                                                                        ]
                                                                    }
                                                                </Form.Control.Feedback>
                                                            )}
                                                        </Form.Group>
                                                    </Col>
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

                                                            <div
                                                                className="rounded p-4 text-center bg-light mb-2"
                                                                style={{
                                                                    borderStyle:
                                                                        "dashed",
                                                                    borderWidth:
                                                                        "2px",
                                                                    cursor: "pointer",
                                                                    borderColor:
                                                                        "#ccc",
                                                                }}
                                                                onDragOver={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                }}
                                                                onDrop={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (
                                                                        e
                                                                            .dataTransfer
                                                                            .files &&
                                                                        e
                                                                            .dataTransfer
                                                                            .files[0]
                                                                    ) {
                                                                        updateRecordedVersion(
                                                                            index,
                                                                            "file",
                                                                            e
                                                                                .dataTransfer
                                                                                .files[0],
                                                                        );
                                                                    }
                                                                }}
                                                                onClick={() =>
                                                                    document
                                                                        .getElementById(
                                                                            `create_file_input_${index}`,
                                                                        )
                                                                        ?.click()
                                                                }
                                                            >
                                                                {rv.file ? (
                                                                    <>
                                                                        <i
                                                                            className={`ri-${rv.media_type === "video" ? "video" : "music"}-line display-4 text-success mb-2 d-block`}
                                                                        ></i>
                                                                        <p className="text-success mb-3 fw-bold">
                                                                            {rv.file
                                                                                ? getCleanFileName(rv.file.name)
                                                                                : ""}
                                                                        </p>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            type="button"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                document
                                                                                    .getElementById(
                                                                                        `create_file_input_${index}`,
                                                                                    )
                                                                                    ?.click();
                                                                            }}
                                                                        >
                                                                            <i className="ri-folder-open-line me-1"></i>{" "}
                                                                            CHANGE
                                                                            FILE
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="ri-upload-cloud-2-line display-4 text-secondary mb-2 d-block"></i>
                                                                        <p className="text-secondary mb-3">
                                                                            Drag
                                                                            &
                                                                            Drop
                                                                            a
                                                                            file
                                                                            to
                                                                            upload
                                                                        </p>
                                                                        <Button
                                                                            variant="outline-success"
                                                                            size="sm"
                                                                            type="button"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                document
                                                                                    .getElementById(
                                                                                        `create_file_input_${index}`,
                                                                                    )
                                                                                    ?.click();
                                                                            }}
                                                                        >
                                                                            <i className="ri-menu-line me-1"></i>{" "}
                                                                            IMPORT
                                                                            FROM
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                <Form.Control
                                                                    id={`create_file_input_${index}`}
                                                                    className="d-none"
                                                                    type="file"
                                                                    accept="audio/*,video/*"
                                                                    onChange={(
                                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                                    ) =>
                                                                        updateRecordedVersion(
                                                                            index,
                                                                            "file",
                                                                            e
                                                                                .target
                                                                                .files?.[0] ||
                                                                                null,
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            {rv.file && (
                                                                <div className="d-flex align-items-center gap-2 mt-1">
                                                                    <Button
                                                                        variant="info"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            setPreviewIndex(
                                                                                index,
                                                                            )
                                                                        }
                                                                    >
                                                                        <i
                                                                            className={`ri-${rv.media_type === "video" ? "video" : "music"}-line me-1`}
                                                                        ></i>{" "}
                                                                        {tr(
                                                                            "preview_media",
                                                                        ) ||
                                                                            "Preview Media"}
                                                                    </Button>
                                                                </div>
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
                                                </Row>
                                            </div>
                                        ),
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Media Preview Modal */}
                            {previewIndex !== null &&
                                data.recorded_versions[previewIndex] && (
                                    <Modal
                                        show={previewIndex !== null}
                                        onHide={() => setPreviewIndex(null)}
                                        size="lg"
                                        centered
                                    >
                                        <Modal.Header closeButton>
                                            <Modal.Title className="text-truncate" style={{ maxWidth: '90%' }}>
                                                {/* {tr("media_preview") || "Media Preview"} */}
                                                {(() => {
                                                    const currentRv = data.recorded_versions[previewIndex];
                                                    const customName = currentRv.file_name?.[currentLocale] || currentRv.file_name?.['gu'] || currentRv.file_name?.['en'];
                                                    let fName = customName || "";
                                                    if (!fName) {
                                                        fName = currentRv.file
                                                            ? getCleanFileName(currentRv.file.name)
                                                            : currentRv.file_url
                                                                ? getCleanFileName(currentRv.file_url)
                                                                : "";
                                                    }
                                                    return fName ? ` ${fName}` : "";
                                                })()}
                                            </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body className="p-0 text-center bg-dark">
                                            {(() => {
                                                const currentRv =
                                                    data.recorded_versions[
                                                        previewIndex
                                                    ];
                                                const pUrl = currentRv.file
                                                    ? URL.createObjectURL(
                                                          currentRv.file,
                                                      )
                                                    : null;
                                                if (!pUrl)
                                                    return (
                                                        <div className="p-4 text-white">
                                                            No media available
                                                        </div>
                                                    );
                                                return currentRv.media_type ===
                                                    "video" ? (
                                                    <video
                                                        controls
                                                        src={pUrl}
                                                        className="w-100"
                                                        style={{
                                                            maxHeight: "70vh",
                                                        }}
                                                        autoPlay
                                                    />
                                                ) : (
                                                    <div className="p-4">
                                                        <audio
                                                            controls
                                                            src={pUrl}
                                                            className="w-100"
                                                            autoPlay
                                                        >
                                                            Your browser does
                                                            not support the
                                                            audio element.
                                                        </audio>
                                                    </div>
                                                );
                                            })()}
                                        </Modal.Body>
                                    </Modal>
                                )}

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
                                    {processing && progress
                                        ? `${tr("uploading_please_wait") || "Uploading, please wait..."} ${progress.percentage}%`
                                        : processing
                                          ? tr("saving")
                                          : tr("save_pad")}
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
