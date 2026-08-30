import React, { useMemo, useState } from "react";

import { Card, Col, Container, Row, Table, Badge, Form } from "react-bootstrap";

import { Head, Link, router, usePage } from "@inertiajs/react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import Layout from "../../../Layouts";

import { toast, ToastContainer } from "react-toastify";

// ─────────────────────────────────────────────────────────────────────────────
// Translation helper
// ─────────────────────────────────────────────────────────────────────────────

const t = (value: any, locale = "en"): string => {
    if (value == null) return "";

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        return (
            value[locale] ??
            value.en ??
            value.gu ??
            Object.values(value)[0] ??
            ""
        );
    }

    return String(value);
};

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status, isGu }: { status?: string; isGu: boolean }) => {
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
        label = isGu ? "પ્રકાશિત" : "Published";
    } else if (key === "draft") {
        label = isGu ? "ડ્રાફ્ટ" : "Draft";
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
// Date
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (value: any) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const str = String(value).trim();

    const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!m) return str;

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const [, year, month, day] = m;

    return `${day} ${months[Number(month) - 1]} ${year}`;
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
    categoryTypes = [],
    filters,
    totalFavorites = 0,
}: any) => {
    const page = usePage().props as any;

    const locale = page.locale === "gu" ? "gu" : "en";

    const isGu = locale === "gu";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    const [search, setSearch] = useState(filters?.search ?? "");

    const [activeType, setActiveType] = useState(filters?.category_type ?? "");

    const [activeValue, setActiveValue] = useState(
        filters?.category_value ?? "",
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Category types
    // ─────────────────────────────────────────────────────────────────────────

    const types = useMemo(() => {
        const map = new Map<string, any>();

        categoryTypes.forEach((item: any) => {
            const key = item.type_en || item.type_gu;

            if (!key) return;

            if (!map.has(key)) {
                map.set(key, item);
            }
        });

        return Array.from(map.values());
    }, [categoryTypes]);

    // ─────────────────────────────────────────────────────────────────────────
    // Values according to selected TYPE
    // ─────────────────────────────────────────────────────────────────────────

    const values = useMemo(() => {
        if (!activeType) {
            return [];
        }

        const filtered = categoryTypes.filter((item: any) => {
            return item.type_en === activeType || item.type_gu === activeType;
        });

        const map = new Map<string, any>();

        filtered.forEach((item: any) => {
            const key = item.value_en || item.value_gu;

            if (!key) return;

            if (!map.has(key)) {
                map.set(key, item);
            }
        });

        return Array.from(map.values());
    }, [categoryTypes, activeType]);

    // ─────────────────────────────────────────────────────────────────────────
    // Apply filters
    // ─────────────────────────────────────────────────────────────────────────

    const applyFilters = (
        newSearch = search,
        newType = activeType,
        newValue = activeValue,
    ) => {
        router.get(
            route("role.pads.favorites", {
                rolePrefix: rolePrefix,
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

    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────

    const handleSearch = (value: string) => {
        setSearch(value);

        applyFilters(value, activeType, activeValue);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Type
    // ─────────────────────────────────────────────────────────────────────────

    const handleTypeChange = (value: string) => {
        setActiveType(value);

        // When type changes, reset value.
        setActiveValue("");

        applyFilters(search, value, "");
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Value
    // ─────────────────────────────────────────────────────────────────────────

    const handleValueChange = (value: string) => {
        setActiveValue(value);

        applyFilters(search, activeType, value);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Remove favorite
    // ─────────────────────────────────────────────────────────────────────────

    const handleRemove = (padId: number) => {
        router.post(
            route("role.pads.toggle-favorite", {
                rolePrefix: rolePrefix,
                pad: padId,
            }),
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success(
                        isGu
                            ? "મનપસંદમાંથી દૂર કર્યું"
                            : "Removed from favorites",
                    );
                },
            },
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Clear filters
    // ─────────────────────────────────────────────────────────────────────────

    const clearFilters = () => {
        setSearch("");
        setActiveType("");
        setActiveValue("");

        router.get(
            route("role.pads.favorites", {
                rolePrefix: rolePrefix,
            }),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <React.Fragment>
            <Head title={isGu ? "મનપસંદ પદો" : "Favorite Pads"} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={isGu ? "મનપસંદ પદો" : "Favorite Pads"}
                        pageTitle={isGu ? "પદો" : "Pads"}
                    />

                    {/* =========================================================
                        Header
                    ========================================================= */}

                    <Card>
                        <Card.Header>
                            <Row className="align-items-center g-3">
                                <Col lg={4}>
                                    <h5 className="card-title mb-1">
                                        {isGu
                                            ? "મારા મનપસંદ પદો"
                                            : "My Favorite Pads"}
                                    </h5>

                                    <p className="text-muted mb-0 small">
                                        {isGu
                                            ? `કુલ ${totalFavorites} પદ`
                                            : `Total ${totalFavorites} pads`}
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
                                                placeholder={
                                                    isGu
                                                        ? "પદ, ગીત, શ્રેણી, મૂલ્ય, રેકોર્ડિંગ શોધો..."
                                                        : "Search pad, lyrics, category, value, recording..."
                                                }
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

                        {/* =====================================================
                            Filters
                        ===================================================== */}

                        <Card.Body className="border-bottom">
                            <Row className="g-3 align-items-end">
                                {/* Category Type */}

                                <Col md={5} lg={5}>
                                    <Form.Label className="fw-semibold">
                                        {isGu
                                            ? "કેટેગરી પ્રકાર"
                                            : "Category Type"}
                                    </Form.Label>

                                    <Form.Select
                                        value={activeType}
                                        onChange={(e) =>
                                            handleTypeChange(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            {isGu ? "બધા પ્રકાર" : "All Types"}
                                        </option>

                                        {types.map((item: any) => (
                                            <option
                                                key={
                                                    item.type_en || item.type_gu
                                                }
                                                value={
                                                    item.type_en || item.type_gu
                                                }
                                            >
                                                {isGu
                                                    ? item.type_gu ||
                                                      item.type_en
                                                    : item.type_en ||
                                                      item.type_gu}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                {/* Category Value */}

                                <Col md={5} lg={5}>
                                    <Form.Label className="fw-semibold">
                                        {isGu
                                            ? "કેટેગરી વેલ્યુ"
                                            : "Category Value"}
                                    </Form.Label>

                                    <Form.Select
                                        value={activeValue}
                                        disabled={!activeType}
                                        onChange={(e) =>
                                            handleValueChange(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            {isGu ? "બધા વેલ્યુ" : "All Values"}
                                        </option>

                                        {values.map((item: any) => (
                                            <option
                                                key={
                                                    item.value_en ||
                                                    item.value_gu
                                                }
                                                value={
                                                    item.value_en ||
                                                    item.value_gu
                                                }
                                            >
                                                {isGu
                                                    ? item.value_gu ||
                                                      item.value_en
                                                    : item.value_en ||
                                                      item.value_gu}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                {/* Clear */}

                                <Col md={2} lg={2}>
                                    <button
                                        type="button"
                                        className="btn btn-soft-secondary w-100"
                                        onClick={clearFilters}
                                    >
                                        <i className="ri-refresh-line me-1" />

                                        {isGu ? "રીસેટ" : "Reset"}
                                    </button>
                                </Col>
                            </Row>
                        </Card.Body>

                        {/* =====================================================
                            Table
                        ===================================================== */}

                        <Card.Body className="p-0">
                            {pads.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="ri-heart-line display-4 text-muted" />

                                    <p className="text-muted mt-3">
                                        {isGu
                                            ? "કોઈ મનપસંદ પદ મળ્યું નથી."
                                            : "No favorite pads found."}
                                    </p>

                                    <Link
                                        href={route("role.pads.list", {
                                            rolePrefix: rolePrefix,
                                        })}
                                        className="btn btn-primary"
                                    >
                                        {isGu ? "પદો જુઓ" : "Browse Pads"}
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
                                                <th style={{ width: 55 }}>#</th>

                                                <th>
                                                    {isGu ? "શીર્ષક" : "Title"}
                                                </th>

                                                <th>
                                                    {isGu
                                                        ? "શ્રેણીઓ"
                                                        : "Categories"}
                                                </th>

                                                <th>
                                                    {isGu ? "સ્થિતિ" : "Status"}
                                                </th>

                                                <th>
                                                    {isGu
                                                        ? "સ્થાપના તારીખ"
                                                        : "Establish Date"}
                                                </th>

                                                <th>
                                                    {isGu
                                                        ? "રેકોર્ડિંગ"
                                                        : "Recording"}
                                                </th>

                                                <th className="text-end">
                                                    {isGu
                                                        ? "ક્રિયા"
                                                        : "Actions"}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {pads.map(
                                                (pad: any, index: number) => {
                                                    const title =
                                                        t(pad.title, locale) ||
                                                        (isGu
                                                            ? "શીર્ષક વગર"
                                                            : "Untitled");

                                                    const recording =
                                                        getRecording(pad);

                                                    return (
                                                        <tr key={pad.id}>
                                                            {/* # */}

                                                            <td className="text-muted">
                                                                {index + 1}
                                                            </td>

                                                            {/* Title */}

                                                            <td>
                                                                <Link
                                                                    href={route(
                                                                        "role.pads.show",
                                                                        {
                                                                            rolePrefix:
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
                                                                        {t(
                                                                            pad.value,
                                                                            locale,
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>

                                                            {/* Categories */}

                                                            <td>
                                                                <div className="d-flex flex-wrap gap-1">
                                                                    {Array.isArray(
                                                                        pad.categories,
                                                                    ) &&
                                                                        pad.categories.map(
                                                                            (
                                                                                category: any,
                                                                                categoryIndex: number,
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        category.id ??
                                                                                        categoryIndex
                                                                                    }
                                                                                    className="badge bg-info-subtle text-info"
                                                                                    title={`${t(
                                                                                        category.type,
                                                                                        locale,
                                                                                    )}: ${t(
                                                                                        category.value,
                                                                                        locale,
                                                                                    )}`}
                                                                                >
                                                                                    <strong>
                                                                                        {t(
                                                                                            category.type,
                                                                                            locale,
                                                                                        )}
                                                                                    </strong>

                                                                                    {
                                                                                        ": "
                                                                                    }

                                                                                    {t(
                                                                                        category.value,
                                                                                        locale,
                                                                                    )}
                                                                                </span>
                                                                            ),
                                                                        )}
                                                                </div>
                                                            </td>

                                                            {/* Status */}

                                                            <td>
                                                                <StatusBadge
                                                                    status={
                                                                        pad.status
                                                                    }
                                                                    isGu={isGu}
                                                                />
                                                            </td>

                                                            {/* Date */}

                                                            <td>
                                                                {formatDate(
                                                                    pad.establish_date,
                                                                )}
                                                            </td>

                                                            {/* Recording */}

                                                            <td>
                                                                {recording ? (
                                                                    <Badge
                                                                        bg="success-subtle"
                                                                        text="success"
                                                                    >
                                                                        {recording.media_type ===
                                                                        "video"
                                                                            ? isGu
                                                                                ? "વિડિયો"
                                                                                : "Video"
                                                                            : isGu
                                                                              ? "ઑડિયો"
                                                                              : "Audio"}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-muted">
                                                                        —
                                                                    </span>
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
                                                                                rolePrefix:
                                                                                    rolePrefix,
                                                                                pad: pad.id,
                                                                            },
                                                                        )}
                                                                        className="btn btn-soft-info btn-sm"
                                                                        title={
                                                                            isGu
                                                                                ? "જુઓ"
                                                                                : "View"
                                                                        }
                                                                    >
                                                                        <i className="ri-eye-fill" />
                                                                    </Link>

                                                                    {/* Edit */}

                                                                    <Link
                                                                        href={route(
                                                                            "role.pads.edit",
                                                                            {
                                                                                rolePrefix:
                                                                                    rolePrefix,
                                                                                pad: pad.id,
                                                                            },
                                                                        )}
                                                                        className="btn btn-soft-warning btn-sm"
                                                                        title={
                                                                            isGu
                                                                                   ? "ફેરફાર"
                                                                                : "Edit"
                                                                        }
                                                                    >
                                                                        <i className="ri-pencil-fill" />
                                                                    </Link>

                                                                    {/* Remove Favorite */}

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-soft-danger btn-sm"
                                                                        title={
                                                                            isGu
                                                                                ? "મનપસંદમાંથી દૂર કરો"
                                                                                : "Remove from favorites"
                                                                        }
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

                    <ToastContainer closeButton={false} limit={1} />
                </Container>
            </div>
        </React.Fragment>
    );
};

Favorites.layout = (page: any) => <Layout children={page} />;

export default Favorites;
