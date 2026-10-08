import React, { useMemo, useState } from "react";

import { Card, Col, Container, Row, Table, Badge, Form, OverlayTrigger, Tooltip } from "react-bootstrap";

import { Head, Link, router, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import Layout from "../../../Layouts";

import { gujaratiNumber } from "../../../utils/number";

// ─────────────────────────────────────────────────────────────────────────────
// Translation helper for dynamic multilingual values
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
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({
    status,
    t,
}: {
    status?: string;
    t: (key: string, replacements?: Record<string, string | number>) => string;
}) => {
    const key = (status || "").toLowerCase();

    const map: Record<string, string> = {
        save: "badge bg-success-subtle text-success text-uppercase",
        published: "badge bg-success-subtle text-success text-uppercase",
        active: "badge bg-success-subtle text-success text-uppercase",
        draft: "badge bg-warning-subtle text-warning text-uppercase",
        inactive: "badge bg-danger-subtle text-danger text-uppercase",
    };

    let label = status || "—";

    if (key === "save" || key === "published") {
        label = t("published");
    } else if (key === "draft") {
        label = t("draft");
    } else if (key === "active") {
        label = t("active");
    } else if (key === "inactive") {
        label = t("inactive");
    }

    return (
        <span
            className={
                map[key] ??
                "badge bg-secondary-subtle text-secondary text-uppercase"
            }
        >
            {label}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Date formatter
// Format: Day Month, Year
// Example English: 10 September, 2026
// Example Gujarati: ૧૦ સપ્ટેમ્બર, ૨૦૨૬
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (value: any, locale: string): string => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const parts = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).formatToParts(date);

    const day = parts.find((part) => part.type === "day")?.value ?? "";

    const month = parts.find((part) => part.type === "month")?.value ?? "";

    const year = parts.find((part) => part.type === "year")?.value ?? "";

    const formatted = `${day} ${month}, ${year}`;

    return gujaratiNumber(formatted, locale);
};

// ─────────────────────────────────────────────────────────────────────────────
// Get recording
// ─────────────────────────────────────────────────────────────────────────────

const getRecording = (pad: any) => {
    if (Array.isArray(pad?.recorded_versions)) {
        return pad.recorded_versions[0] ?? null;
    }

    return pad?.recorded_version ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Favorites
// ─────────────────────────────────────────────────────────────────────────────

const Favorites = ({
    pads = [],
    filterCategoryOptions = [],
    filters,
    totalFavorites = 0,
}: any) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale } = page;

    // Current application locale
    const currentLocale = locale || "gu";

    // Central translator
    const tr = useMemo(() => createTranslator(translations), [translations]);

    // Dynamic role prefix
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    // ─────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────

    const [search, setSearch] = useState(filters?.search ?? "");

    const [activeType, setActiveType] = useState(filters?.category_type ?? "");

    const [activeValue, setActiveValue] = useState(
        filters?.category_value ?? "",
    );

    // ─────────────────────────────────────────────────────────────────────
    // Category Types
    // ─────────────────────────────────────────────────────────────────────

    const types = useMemo(() => {
        const map = new Map<string, any>();

        filterCategoryOptions.forEach((item: any) => {
            // Prefer object style, then any type_* key
            const key =
                tValue(item.type, currentLocale) ||
                item[`type_${currentLocale}`] ||
                item.type_en ||
                item.type_gu ||
                Object.keys(item)
                    .filter((k) => k.startsWith("type_"))
                    .map((k) => item[k])
                    .find(Boolean);

            if (!key) return;
            if (!map.has(key)) map.set(key, item);
        });

        return Array.from(map.values());
    }, [filterCategoryOptions, currentLocale]);

    const values = useMemo(() => {
        if (!activeType) return [];

        const filtered = filterCategoryOptions.filter((item: any) => {
            const typeValue =
                tValue(item.type, currentLocale) ||
                item[`type_${currentLocale}`] ||
                item.type_en ||
                item.type_gu;

            return (
                typeValue === activeType ||
                item.type_en === activeType ||
                item.type_gu === activeType ||
                item[`type_${currentLocale}`] === activeType
            );
        });

        const map = new Map<string, any>();

        filtered.forEach((item: any) => {
            const key =
                tValue(item.value, currentLocale) ||
                item[`value_${currentLocale}`] ||
                item.value_en ||
                item.value_gu ||
                Object.keys(item)
                    .filter((k) => k.startsWith("value_"))
                    .map((k) => item[k])
                    .find(Boolean);

            if (!key) return;
            if (!map.has(key)) map.set(key, item);
        });

        return Array.from(map.values());
    }, [filterCategoryOptions, activeType, currentLocale]);
    // ─────────────────────────────────────────────────────────────────────
    // Apply Filters
    // ─────────────────────────────────────────────────────────────────────

    
    const applyFilters = (
        newSearch = search,
        newType = activeType,
        newValue = activeValue,
    ) => {
        router.get(
            route("role.pads.favorites", {
                rolePrefix,
            }),
            {
                search: newSearch || undefined,
                category_type: newType || undefined,
                category_value: newValue || undefined,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────

    const handleSearch = (value: string) => {
        setSearch(value);

        applyFilters(value, activeType, activeValue);
    };

    // ─────────────────────────────────────────────────────────────────────
    // Type Change
    // ─────────────────────────────────────────────────────────────────────

    const handleTypeChange = (value: string) => {
        setActiveType(value);
        setActiveValue("");

        applyFilters(search, value, "");
    };

    // ─────────────────────────────────────────────────────────────────────
    // Value Change
    // ─────────────────────────────────────────────────────────────────────

    const handleValueChange = (value: string) => {
        setActiveValue(value);

        applyFilters(search, activeType, value);
    };

    // ─────────────────────────────────────────────────────────────────────
    // Remove from Favorites
    // ─────────────────────────────────────────────────────────────────────

    const handleRemove = (padId: number) => {
        router.post(
            route("role.pads.toggle-favorite", {
                rolePrefix,
                pad: padId,
            }),
            {},
            {
                preserveScroll: true,
                replace: true,

                // onSuccess: () => {
                //     // toast.success(tr("removed_from_favorites"));
                // },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────
    // Clear Filters
    // ─────────────────────────────────────────────────────────────────────

    const clearFilters = () => {
        setSearch("");
        setActiveType("");
        setActiveValue("");

        router.get(
            route("role.pads.favorites", {
                rolePrefix,
            }),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────
    // Page Title
    // ─────────────────────────────────────────────────────────────────────

    const pageTitle = tr("favorite_pads");

    return (
        <React.Fragment>
            <Head title={pageTitle} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={pageTitle} pageTitle={tr("pads")} />

                    {/* Header */}
                    <Card>
                        <Card.Header>
                            <Row className="align-items-center g-3">
                                <Col lg={4}>
                                    <h5 className="card-title mb-1">
                                        {tr("my_favorite_pads")}
                                    </h5>

                                    <p className="text-muted mb-0 small">
                                        {tr("total_pads")}:{" "}
                                        {gujaratiNumber(
                                            totalFavorites,
                                            currentLocale,
                                        )}
                                    </p>
                                </Col>

                                {/* Search */}
                                <Col lg={8}>
                                    <div className="d-flex justify-content-end">
                                        <div
                                            className="position-relative"
                                            style={{
                                                width: "100%",
                                                maxWidth: "400px",
                                            }}
                                        >
                                            <i
                                                className="ri-search-line position-absolute"
                                                style={{
                                                    left: "12px",
                                                    top: "50%",
                                                    transform:
                                                        "translateY(-50%)",
                                                    zIndex: 2,
                                                }}
                                            />

                                            <Form.Control
                                                type="search"
                                                className="ps-5"
                                                placeholder={tr(
                                                    "search_favorites_placeholder",
                                                )}
                                                value={search}
                                                onChange={(e) =>
                                                    handleSearch(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Header>

                        {/* Filters */}
                        <Card.Body className="border-bottom">
                            <Row className="g-3 align-items-end">
                                {/* Category Type */}
                                <Col md={5} lg={5}>
                                    <Form.Label className="fw-semibold">
                                        {tr("category_type")}
                                    </Form.Label>

                                    <Form.Select
                                        value={activeType}
                                        onChange={(e) =>
                                            handleTypeChange(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            {tr("all_types")}
                                        </option>

                                        {types.map((item: any) => {
                                            const typeLabel =
                                                tValue(
                                                    item.type,
                                                    currentLocale,
                                                ) ||
                                                tValue(
                                                    {
                                                        en: item.type_en,
                                                        gu: item.type_gu,
                                                    },
                                                    currentLocale,
                                                );

                                            const typeValue =
                                                item.type_en ||
                                                item.type_gu ||
                                                typeLabel;

                                            return (
                                                <option
                                                    key={typeValue}
                                                    value={typeValue}
                                                >
                                                    {typeLabel}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>

                                {/* Category Value */}
                                <Col md={5} lg={5}>
                                    <Form.Label className="fw-semibold">
                                        {tr("category_value")}
                                    </Form.Label>

                                    <Form.Select
                                        value={activeValue}
                                        disabled={!activeType}
                                        onChange={(e) =>
                                            handleValueChange(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            {tr("all_values")}
                                        </option>

                                        {values.map((item: any) => {
                                            const valueLabel =
                                                tValue(
                                                    item.value,
                                                    currentLocale,
                                                ) ||
                                                tValue(
                                                    {
                                                        en: item.value_en,
                                                        gu: item.value_gu,
                                                    },
                                                    currentLocale,
                                                );

                                            const valueValue =
                                                item.value_en ||
                                                item.value_gu ||
                                                valueLabel;

                                            return (
                                                <option
                                                    key={valueValue}
                                                    value={valueValue}
                                                >
                                                    {valueLabel}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>

                                {/* Clear */}
                                <Col md={2} lg={1}>
                                    <button
                                        type="button"
                                        className="btn btn-soft-secondary w-100"
                                        onClick={clearFilters}
                                    >
                                        <i className="ri-refresh-line me-1" />

                                        {tr("reset")}
                                    </button>
                                </Col>
                            </Row>
                        </Card.Body>

                        {/* Table */}
                        <Card.Body className="p-0">
                            {pads.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="ri-heart-line display-4 text-muted" />

                                    <p className="text-muted mt-3">
                                        {tr("no_favorite_pads")}
                                    </p>

                                    <Link
                                        href={route("role.pads.list", {
                                            rolePrefix,
                                        })}
                                        className="btn btn-primary"
                                    >
                                        {tr("browse_pads")}
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table
                                        className="table-hover align-middle mb-0"
                                        style={{
                                            fontSize: "13px",
                                        }}
                                    >
                                        <thead className="table-light">
                                            <tr>
                                                <th
                                                    style={{
                                                        width: 55,
                                                    }}
                                                >
                                                    {tr("id")}
                                                </th>

                                                <th>{tr("title")}</th>

                                                <th>{tr("categories")}</th>

                                                <th>{tr("status")}</th>

                                                <th>{tr("establish_date")}</th>


                                                <th className="text-end">
                                                    {tr("actions")}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {pads.map(
                                                (pad: any, index: number) => {
                                                    const title =
                                                        tValue(
                                                            pad.title,
                                                            currentLocale,
                                                        ) || tr("untitled");

                                                    const recording =
                                                        getRecording(pad);

                                                    return (
                                                        <tr key={pad.id}>
                                                            {/* Number */}
                                                            <td className="text-muted">
                                                                {gujaratiNumber(
                                                                    index + 1,
                                                                    currentLocale,
                                                                )}
                                                            </td>

                                                            {/* Title */}
                                                            <td>
                                                                <Link
                                                                    href={route(
                                                                        "role.pads.show",
                                                                        {
                                                                            rolePrefix,
                                                                            pad: pad.id,
                                                                        },
                                                                    )}
                                                                    className="fw-semibold text-body text-decoration-none"
                                                                >
                                                                    {title}
                                                                </Link>

                                                                {pad.value && (
                                                                    <div
                                                                        className="text-muted small mt-1"
                                                                        style={{
                                                                            maxWidth:
                                                                                "350px",
                                                                            whiteSpace:
                                                                                "nowrap",
                                                                            overflow:
                                                                                "hidden",
                                                                            textOverflow:
                                                                                "ellipsis",
                                                                        }}
                                                                    >
                                                                        {tValue(
                                                                            pad.value,
                                                                            currentLocale,
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>

                                                            {/* Categories */}
                                                            <td>
                                                                <div className="d-flex flex-wrap gap-1">
                                                                    {(() => {
                                                                        const categories = Array.isArray(pad.categories) ? pad.categories : [];
                                                                        const visible = categories.slice(0, 3);
                                                                        const hidden = categories.slice(3);

                                                                        return (
                                                                            <>
                                                                                {visible.map((category: any, categoryIndex: number) => {
                                                                                    const categoryType = tValue(category.type, currentLocale);
                                                                                    const categoryValue = tValue(category.value, currentLocale);
                                                                                    return (
                                                                                        <span key={category.id ?? categoryIndex} className="badge bg-info-subtle text-info">
                                                                                            <strong>{categoryType}</strong>{": "}{categoryValue}
                                                                                        </span>
                                                                                    );
                                                                                })}
                                                                                {hidden.length > 0 && (
                                                                                    <OverlayTrigger
                                                                                        placement="top"
                                                                                        overlay={
                                                                                            <Tooltip id={`tooltip-cat-${pad.id}`}>
                                                                                                <div className="d-flex flex-column text-start gap-1">
                                                                                                    {hidden.map((c: any, i: number) => (
                                                                                                        <div key={c.id ?? i}>
                                                                                                            <strong>{tValue(c.type, currentLocale)}:</strong>{" "}
                                                                                                            {tValue(c.value, currentLocale)}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            </Tooltip>
                                                                                        }
                                                                                    >
                                                                                        <span className="badge bg-secondary-subtle text-secondary" style={{ cursor: "pointer" }}>
                                                                                            +{gujaratiNumber(hidden.length, currentLocale)}
                                                                                        </span>
                                                                                    </OverlayTrigger>
                                                                                )}
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </td>

                                                            {/* Status */}
                                                            <td>
                                                                <StatusBadge
                                                                    status={
                                                                        pad.status
                                                                    }
                                                                    t={tr}
                                                                />
                                                            </td>

                                                            {/* Date */}
                                                            <td>
                                                                {formatDate(
                                                                    pad.establish_date,
                                                                    currentLocale,
                                                                )}
                                                            </td>



                                                            {/* Actions */}
                                                            <td className="text-end">
                                                                <div className="d-flex gap-1 justify-content-end">
                                                                    {/* View */}
                                                                    <Link
                                                                        href={route(
                                                                            "role.pads.show",
                                                                            {
                                                                                rolePrefix,
                                                                                pad: pad.id,
                                                                            },
                                                                        )}
                                                                        className="btn btn-soft-info btn-sm"
                                                                        title={tr(
                                                                            "view",
                                                                        )}
                                                                    >
                                                                        <i className="ri-eye-fill" />
                                                                    </Link>

                                                                    {/* Edit */}
                                                                    <Link
                                                                        href={route(
                                                                            "role.pads.edit",
                                                                            {
                                                                                rolePrefix,
                                                                                pad: pad.id,
                                                                            },
                                                                        )}
                                                                        className="btn btn-soft-warning btn-sm"
                                                                        title={tr(
                                                                            "edit",
                                                                        )}
                                                                    >
                                                                        <i className="ri-pencil-fill" />
                                                                    </Link>

                                                                    {/* Remove Favorite */}
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-soft-danger btn-sm"
                                                                        title={tr(
                                                                            "remove_from_favorites",
                                                                        )}
                                                                        onClick={() =>
                                                                            handleRemove(
                                                                                pad.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="ri-heart-fill" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* <ToastContainer closeButton={false} limit={1} /> */}
                </Container>
            </div>
        </React.Fragment>
    );
};

Favorites.layout = (page: any) => <Layout children={page} />;

export default Favorites;
