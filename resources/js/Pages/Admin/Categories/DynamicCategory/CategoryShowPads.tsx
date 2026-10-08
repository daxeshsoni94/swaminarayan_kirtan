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
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { Head, Link, usePage, router } from "@inertiajs/react";
import Layout from "../../../../Layouts";
import Swal from "sweetalert2";
import { gujaratiNumber } from "../../../../utils/number";

const tValue = (value: any, locale: string): string => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        return value[locale] ?? Object.values(value)[0] ?? "";
    }
    return String(value);
};

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

const StatusBadge = ({ status, tr }: { status?: string; tr: any }) => {
    const key = (status || "").toLowerCase();
    const map: Record<string, string> = {
        save: "badge bg-success-subtle text-success text-uppercase",
        published: "badge bg-success-subtle text-success text-uppercase",
        active: "badge bg-success-subtle text-success text-uppercase",
        draft: "badge bg-warning-subtle text-warning text-uppercase",
        inactive: "badge bg-danger-subtle text-danger text-uppercase",
    };

    let label = status || "—";
    if (key === "save" || key === "published") label = tr("published");
    else if (key === "draft") label = tr("draft");
    else if (key === "active") label = tr("active");
    else if (key === "inactive") label = tr("inactive");

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

const formatDate = (value: any, locale: string): string => {
    if (!value) return "—";
    const str = String(value).trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return str;

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (Number.isNaN(date.getTime())) return str;

    const parts = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).formatToParts(date);

    const dayPart = parts.find((p) => p.type === "day")?.value ?? "";
    const monthPart = parts.find((p) => p.type === "month")?.value ?? "";
    const yearPart = parts.find((p) => p.type === "year")?.value ?? "";

    return gujaratiNumber(`${dayPart} ${monthPart}, ${yearPart}`, locale);
};

const storageUrl = (fileUrl: string | null | undefined): string | null => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http") || fileUrl.startsWith("/storage/")) {
        return fileUrl;
    }
    return `/storage/${String(fileUrl).replace(/^\//, "")}`;
};

interface Props {
    type: string;
    typeConfig: { translation_key: string; is_custom?: boolean };
    category: { id: number; name: string; type: string };
    pads?: any[];
}

const CategoryShowPads = ({ type, typeConfig, category, pads = [] }: Props) => {
    const page = usePage().props as any;
    const { auth, translations = {}, locale } = page;
    const currentLocale = locale || "gu";
    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix =
        auth?.user?.role?.name?.toLowerCase().replace(/\s+/g, "-") || "admin";

    const categoryName =
        tValue(category?.name, currentLocale) || tr(typeConfig.translation_key);

    const categoryTypeLabel = tValue(category?.type, currentLocale) || "";

    // If this is a custom category, back link should keep the type filter
    const isCustom = type === "custom" || !!typeConfig?.is_custom;
    const backHref =
        isCustom && categoryTypeLabel
            ? route("role.category.list", {
                  rolePrefix,
                  type: "custom",
              }) + `?custom_type=${encodeURIComponent(categoryTypeLabel)}`
            : route("role.category.list", { rolePrefix, type });

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleting, setDeleting] = useState(false);

    const allSelected = pads.length > 0 && selectedIds.length === pads.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    const toggleAll = () => {
        setSelectedIds(allSelected ? [] : pads.map((p) => p.id));
    };

    const toggleOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const handleDeleteOne = (id: number, title: string) => {
        Swal.fire({
            title: tr("are_you_sure"),
            text: tr("pad_delete_confirmation", { title }),
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: tr("yes_delete"),
            cancelButtonText: tr("cancel"),
            confirmButtonColor: "#d33",
        }).then((result) => {
            if (!result.isConfirmed) return;

            router.delete(route("role.pads.destroy", { rolePrefix, pad: id }), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds((prev) => prev.filter((x) => x !== id));
                },
            });
        });
    };

    const handleMassDelete = () => {
        if (selectedIds.length === 0) return;

        Swal.fire({
            title: tr("are_you_sure"),
            text: tr("pads_delete_confirmation", {
                count: selectedIds.length,
            }),
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: tr("yes_delete_them"),
            cancelButtonText: tr("cancel"),
            confirmButtonColor: "#d33",
        }).then((result) => {
            if (!result.isConfirmed) return;

            setDeleting(true);
            router.post(
                route("role.pads.bulk-destroy", { rolePrefix }),
                { ids: selectedIds, _method: "DELETE" },
                {
                    preserveScroll: true,
                    onSuccess: () => setSelectedIds([]),
                    onFinish: () => setDeleting(false),
                },
            );
        });
    };

    const pageTitle =
        isCustom && categoryTypeLabel
            ? tr("custom_category_pads_title", {
                  type: categoryTypeLabel,
                  name: categoryName,
              }) || `${categoryTypeLabel} — ${categoryName}`
            : tr(`${type}_pads_title`, { [type]: categoryName, name: categoryName, type: tr(type) || type }) ||
              tr("pads_of", { name: categoryName });

    const breadcrumbParent = isCustom
        ? categoryTypeLabel || tr(typeConfig.translation_key)
        : tr(typeConfig.translation_key);

    const pageTitleNode = pageTitle.length > 50 ? (
        <OverlayTrigger
            placement="top"
            overlay={
                <Tooltip id="tooltip-page-title">
                    {pageTitle}
                </Tooltip>
            }
        >
            <span style={{ cursor: "pointer" }}>
                {pageTitle.substring(0, 50) + "..."}
            </span>
        </OverlayTrigger>
    ) : (
        pageTitle
    );

    return (
        <React.Fragment>
            <Head title={pageTitle} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={pageTitleNode}
                        pageTitle={breadcrumbParent}
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-1">
                                            {pageTitleNode}
                                        </h5>
                                        <p className="text-muted mb-0 small">
                                            {tr("total_pads")}:{" "}
                                            {gujaratiNumber(
                                                pads.length,
                                                currentLocale,
                                            )}
                                        </p>
                                    </div>
                                    <Link
                                        href={backHref}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        <i className="ri-arrow-left-line me-1"></i>
                                        {tr("back")}
                                    </Link>
                                </Card.Header>
                            </Card>

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
                                            {/* ({selectedIds.length}) */}
                                        </Button>
                                    )}
                                </Card.Header>

                                <Card.Body className="p-0">
                                    {pads.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            {tr(`no_${type}_pads_found`) ||
                                                tr(
                                                    "no_custom_category_pads_found",
                                                ) ||
                                                tr("no_pads_found")}
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table
                                                className="table-hover align-middle mb-0"
                                                style={{ fontSize: "13px" }}
                                            >
                                                <thead className="table-light">
                                                    <tr>
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
                                                        <th
                                                            style={{
                                                                width: "40px",
                                                            }}
                                                        >
                                                            {tr("id")}
                                                        </th>
                                                        <th>{tr("title")}</th>
                                                        <th>{tr("status")}</th>
                                                        <th>
                                                            {tr(
                                                                "establish_date",
                                                            )}
                                                        </th>
                                                        <th>
                                                            {tr("recording")}
                                                        </th>
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
                                                                <td>
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        checked={selectedIds.includes(
                                                                            pad.id,
                                                                        )}
                                                                        onChange={() =>
                                                                            toggleOne(
                                                                                pad.id,
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="text-muted">
                                                                    {index + 1}
                                                                </td>
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
                                                                <td>
                                                                    <StatusBadge
                                                                        status={
                                                                            pad.status
                                                                        }
                                                                        tr={tr}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    {formatDate(
                                                                        pad.establish_date,
                                                                        currentLocale,
                                                                    )}
                                                                </td>
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
                                                                <td className="text-end">
                                                                    <div className="d-flex gap-1 justify-content-end">
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
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-soft-danger btn-sm"
                                                                            title={tr(
                                                                                "delete",
                                                                            )}
                                                                            onClick={() =>
                                                                                handleDeleteOne(
                                                                                    pad.id,
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

CategoryShowPads.layout = (page: any) => <Layout children={page} />;
export default CategoryShowPads;
