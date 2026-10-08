import React, { useMemo, useState } from "react";

import {
    Card,
    Col,
    Container,
    Row,
    Table,
    Badge,
    Form,
    Button,
} from "react-bootstrap";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

import { Head, Link, usePage, router } from "@inertiajs/react";

import Layout from "../../../../Layouts";

import Swal from "sweetalert2";

import { gujaratiNumber } from "../../../../utils/number";

/**
 * Resolve multilingual database value.
 *
 * Example:
 * {
 *     en: "Ahmedabad",
 *     gu: "અમદાવાદ"
 * }
 */
const tValue = (value: any, locale: string): string => {
    if (value == null) return "";

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        return (
            value?.[locale] ??
            Object.values(value).find(
                (item) => typeof item === "string" && item.trim() !== "",
            ) ??
            ""
        );
    }

    return String(value);
};

/**
 * Centralized translation helper.
 *
 * Supports:
 * tr("pads")
 * tr("total_pads_count", { count: 10 })
 */
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

/**
 * Status Badge
 */
const StatusBadge = ({
    status,
    tr,
}: {
    status?: string;
    tr: (key: string, replacements?: Record<string, string | number>) => string;
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
        label = tr("published");
    } else if (key === "draft") {
        label = tr("draft");
    } else if (key === "active") {
        label = tr("active");
    } else if (key === "inactive") {
        label = tr("inactive");
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

/**
 * Format date according to current locale.
 */
const formatDate = (value: any, locale: string): string => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const str = String(value).trim();

    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!match) {
        return str;
    }

    const [, year, month, day] = match;

    const date = new Date(Number(year), Number(month) - 1, Number(day));

    if (Number.isNaN(date.getTime())) {
        return str;
    }

    const parts = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).formatToParts(date);

    const dayPart = parts.find((part) => part.type === "day")?.value ?? "";
    const monthPart = parts.find((part) => part.type === "month")?.value ?? "";
    const yearPart = parts.find((part) => part.type === "year")?.value ?? "";

    const formatted = `${dayPart} ${monthPart}, ${yearPart}`;

    return gujaratiNumber(formatted, locale);
};

/**
 * Storage URL helper.
 */
const storageUrl = (fileUrl: string | null | undefined) => {
    if (!fileUrl) return null;

    if (fileUrl.startsWith("http") || fileUrl.startsWith("/storage/")) {
        return fileUrl;
    }

    return `/storage/${String(fileUrl).replace(/^\//, "")}`;
};

interface PlaceShowPadsProps {
    place: any;
    pads?: any[];
}

const PlaceShowPads = ({ place, pads = [] }: PlaceShowPadsProps) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale, languages = [] } = page;

    /**
     * Current locale from Laravel/Inertia.
     */
    const currentLocale = locale || "gu";

    /**
     * Centralized translator.
     */
    const tr = useMemo(() => createTranslator(translations), [translations]);

    /**
     * Dynamic role prefix.
     */
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    /**
     * Place name.
     */
    const placeName =
        tValue(place?.name, currentLocale) ||
        tValue(place?.title, currentLocale) ||
        tValue(place?.value, currentLocale) ||
        tr("place");

    // ─────────────────────────────────────────────────────────────
    // Selection state
    // ─────────────────────────────────────────────────────────────

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [deleting, setDeleting] = useState(false);

    const allSelected = pads.length > 0 && selectedIds.length === pads.length;

    const someSelected = selectedIds.length > 0 && !allSelected;

    const toggleAll = () => {
        setSelectedIds(allSelected ? [] : pads.map((pad) => Number(pad.id)));
    };

    const toggleOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    // ─────────────────────────────────────────────────────────────
    // Single delete
    // ─────────────────────────────────────────────────────────────

    const handleDeleteOne = (id: number, title: string) => {
        Swal.fire({
            title: tr("are_you_sure"),

            text: tr("pad_delete_confirmation", {
                title,
            }),

            icon: "warning",

            showCancelButton: true,

            confirmButtonText: tr("yes_delete"),

            cancelButtonText: tr("cancel"),

            confirmButtonColor: "#d33",
        }).then((result) => {
            if (!result.isConfirmed) return;

            router.delete(
                route("role.pads.destroy", {
                    rolePrefix,
                    pad: id,
                }),
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        setSelectedIds((prev) => prev.filter((x) => x !== id));

                        // toast.success(tr("pad_deleted_success"));
                    },

                    onError: () => {
                        // toast.error(tr("pad_delete_failed"));
                    },
                },
            );
        });
    };

    // ─────────────────────────────────────────────────────────────
    // Mass delete
    // ─────────────────────────────────────────────────────────────

    const handleMassDelete = () => {
        const ids = [...selectedIds];

        if (ids.length === 0) {
            // toast.warning(tr("select_at_least_one_pad"));

            return;
        }

        Swal.fire({
            title: tr("are_you_sure"),

            text: tr("pads_delete_confirmation", {
                count: ids.length,
            }),

            icon: "warning",

            showCancelButton: true,

            confirmButtonText: tr("yes_delete_them"),

            cancelButtonText: tr("cancel"),

            confirmButtonColor: "#d33",
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            setDeleting(true);

            router.post(
                route("role.pads.bulk-destroy", {
                    rolePrefix,
                }),
                {
                    ids,
                    _method: "DELETE",
                },
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        setSelectedIds([]);

                        // toast.success(tr("pads_deleted_success"));
                    },

                    onError: () => {
                        // toast.error(tr("pads_delete_failed"));
                    },

                    onFinish: () => {
                        setDeleting(false);
                    },
                },
            );
        });
    };

    /**
     * Page title.
     */
    const pageTitle = tr("place_pads_title", {
        place: placeName,
    });

    return (
        <React.Fragment>
            <Head title={pageTitle} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={pageTitle} pageTitle={tr("pads")} />

                    <Row>
                        <Col lg={12}>
                            {/* Place header */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-1">
                                            {pageTitle}
                                        </h5>

                                        <p className="text-muted mb-0 small">
                                            {tr("total_pads")}:{" "}
                                            {gujaratiNumber(
                                                pads.length,
                                                currentLocale,
                                            )}
                                        </p>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Link
                                            href={route(
                                                "role.category.placelist",
                                                {
                                                    rolePrefix,
                                                },
                                            )}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <i className="ri-arrow-left-line me-1"></i>

                                            {tr("back")}
                                        </Link>
                                    </div>
                                </Card.Header>
                            </Card>

                            {/* Pads List */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0 fw-semibold">
                                        <i className="ri-music-2-line me-1"></i>

                                        {tr("pads_list")}
                                    </h6>

                                    {selectedIds.length > 0 && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={deleting}
                                            onClick={handleMassDelete}
                                        >
                                            <i className="ri-delete-bin-line me-1"></i>
                                            {tr("delete_selected")} (
                                            {selectedIds.length})
                                        </Button>
                                    )}
                                </Card.Header>

                                <Card.Body className="p-0">
                                    {pads.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            {tr("no_place_pads_found")}
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
                                                        {/* Select all */}
                                                        <th
                                                            style={{
                                                                width: "40px",
                                                            }}
                                                        >
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={
                                                                    allSelected
                                                                }
                                                                ref={(
                                                                    el: any,
                                                                ) => {
                                                                    if (el) {
                                                                        el.indeterminate =
                                                                            someSelected;
                                                                    }
                                                                }}
                                                                onChange={
                                                                    toggleAll
                                                                }
                                                            />
                                                        </th>

                                                        {/* ID */}
                                                        <th
                                                            style={{
                                                                width: "40px",
                                                            }}
                                                        >
                                                            {tr("id")}
                                                        </th>

                                                        {/* Title */}
                                                        <th>{tr("title")}</th>

                                                        {/* Status */}
                                                        <th>{tr("status")}</th>

                                                        {/* Establish Date */}
                                                        <th>
                                                            {tr(
                                                                "establish_date",
                                                            )}
                                                        </th>

                                                        {/* Recording */}
                                                        <th>
                                                            {tr("recording")}
                                                        </th>

                                                        {/* Actions */}
                                                        <th className="text-end">
                                                            {tr("actions")}
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {pads.map((pad, index) => {
                                                        const title =
                                                            tValue(
                                                                pad.title,
                                                                currentLocale,
                                                            ) || tr("untitled");

                                                        const recording =
                                                            pad.recorded_version;

                                                        const hasMedia =
                                                            !!storageUrl(
                                                                recording?.file_url,
                                                            );

                                                        return (
                                                            <tr key={pad.id}>
                                                                {/* Checkbox */}
                                                                <td>
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        checked={selectedIds.includes(
                                                                            Number(
                                                                                pad.id,
                                                                            ),
                                                                        )}
                                                                        onChange={() =>
                                                                            toggleOne(
                                                                                Number(
                                                                                    pad.id,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                </td>

                                                                {/* ID */}
                                                                <td className="text-muted">
                                                                    {gujaratiNumber(
                                                                        index +
                                                                            1,
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
                                                                        className="fw-medium text-body"
                                                                    >
                                                                        {title}
                                                                    </Link>
                                                                </td>

                                                                {/* Status */}
                                                                <td>
                                                                    <StatusBadge
                                                                        status={
                                                                            pad.status
                                                                        }
                                                                        tr={tr}
                                                                    />
                                                                </td>

                                                                {/* Establish Date */}
                                                                <td>
                                                                    {formatDate(
                                                                        pad.establish_date,
                                                                        currentLocale,
                                                                    )}
                                                                </td>

                                                                {/* Recording */}
                                                                <td>
                                                                    {hasMedia ? (
                                                                        <Badge
                                                                            bg="success-subtle"
                                                                            text="success"
                                                                            className="text-uppercase"
                                                                        >
                                                                            {recording?.media_type ===
                                                                            "video"
                                                                                ? tr(
                                                                                      "video",
                                                                                  )
                                                                                : tr(
                                                                                      "audio",
                                                                                  )}
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
                                                                                    rolePrefix,
                                                                                    pad: pad.id,
                                                                                },
                                                                            )}
                                                                            className="btn btn-soft-info btn-sm"
                                                                            title={tr(
                                                                                "view",
                                                                            )}
                                                                        >
                                                                            <i className="ri-eye-fill"></i>
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
                                                                            <i className="ri-pencil-fill"></i>
                                                                        </Link>

                                                                        {/* Delete */}
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-soft-danger btn-sm"
                                                                            title={tr(
                                                                                "delete",
                                                                            )}
                                                                            onClick={() =>
                                                                                handleDeleteOne(
                                                                                    Number(
                                                                                        pad.id,
                                                                                    ),
                                                                                    title,
                                                                                )
                                                                            }
                                                                        >
                                                                            <i className="ri-delete-bin-fill"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

PlaceShowPads.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default PlaceShowPads;
