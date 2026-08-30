import React, { useState } from "react";
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
import Swal from "sweetalert2"; // remove if you use a different confirm/toast lib
import { toast } from "react-toastify";

// ── Resolve translation object → string ───────────────────────────────────────
const t = (v: any, locale = "en"): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
        return v[locale] ?? v.en ?? v.gu ?? Object.values(v)[0] ?? "";
    }
    return String(v);
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (value: any) => {
    if (value === null || value === undefined || value === "") return "—";
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

const storageUrl = (fileUrl: string | null | undefined) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http") || fileUrl.startsWith("/storage/")) {
        return fileUrl;
    }
    return `/storage/${String(fileUrl).replace(/^\//, "")}`;
};

// ─── Show (All Pads of a Swami) ───────────────────────────────────────────────
const AdjectivesShowPads = ({
    swami,
    pads = [],
}: {
    swami: any;
    pads?: any[];
}) => {
    const page = usePage().props as { locale?: string };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const isGu = locale === "gu";

    const swamiName =
        t(swami?.name, locale) ||
        t(swami?.title, locale) ||
        (isGu ? "સ્વામી" : "Swami");

    // ── Selection state for mass delete ────────────────────────────────────
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

    // ── Single delete ────────────────────────────────────────────────────
    const handleDeleteOne = (id: number, title: string) => {
        Swal.fire({
            title: isGu ? "શું તમે ખાતરી છો?" : "Are you sure?",
            text: isGu
                ? `"${title}" ડિલીટ કરવામાં આવશે.`
                : `"${title}" will be permanently deleted.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: isGu ? "હા, ડિલીટ કરો" : "Yes, delete it",
            cancelButtonText: isGu ? "રદ કરો" : "Cancel",
            confirmButtonColor: "#d33",
        }).then((result) => {
            if (!result.isConfirmed) return;

            router.delete(route("admin.pads.creator.destroy", id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds((prev) => prev.filter((x) => x !== id));
                },
            });
        });
    };

    // ── Mass delete ───────────────────────────────────────────────────────
    const handleMassDelete = () => {
        const ids = [...selectedIds];

        console.log("Mass delete IDs:", ids);

        if (ids.length === 0) {
            toast.warning(
                isGu
                    ? "કૃપા કરીને ઓછામાં ઓછું એક પદ પસંદ કરો."
                    : "Please select at least one pad.",
            );
            return;
        }

        Swal.fire({
            title: isGu ? "શું તમે ખાતરી છો?" : "Are you sure?",
            text: isGu
                ? `પસંદ કરેલા ${ids.length} પદ ડિલીટ કરવામાં આવશે.`
                : `${ids.length} selected pad(s) will be permanently deleted.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: isGu ? "હા, ડિલીટ કરો" : "Yes, delete them",
            cancelButtonText: isGu ? "રદ કરો" : "Cancel",
            confirmButtonColor: "#d33",
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            console.log("Sending IDs:", ids);

            setDeleting(true);

            router.post(
                route("admin.pads.creator.massdestroy"),
                {
                    ids: ids,
                    _method: "DELETE",
                },
                {
                    preserveScroll: true,

                    onStart: () => {
                        console.log("Mass delete request started");
                    },

                    onSuccess: () => {
                        console.log("Mass delete successful");

                        setSelectedIds([]);

                        toast.success(
                            isGu
                                ? "પદ સફળતાપૂર્વક ડિલીટ થયા."
                                : "Pads deleted successfully.",
                        );
                    },

                    onError: (errors) => {
                        console.error("Mass delete errors:", errors);

                        toast.error(
                            isGu
                                ? "પદ ડિલીટ કરવામાં નિષ્ફળતા."
                                : "Failed to delete pads.",
                        );
                    },

                    onFinish: () => {
                        console.log("Mass delete finished");
                        setDeleting(false);
                    },
                },
            );
        });
    };

    return (
        <React.Fragment>
            <Head
                title={isGu ? `${swamiName} ના પદ` : `Pads of ${swamiName}`}
            />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={
                            isGu ? `${swamiName} ના પદ` : `Pads of ${swamiName}`
                        }
                        pageTitle={isGu ? "પદ" : "Pads"}
                    />

                    {/* Locale indicator */}
                    {/* <div className="mb-3">
                        <span className="badge bg-primary">
                            Viewing in: {isGu ? "ગુજરાતી (GU)" : "English (EN)"}
                        </span>
                        <small className="text-muted ms-2">
                            {isGu
                                ? "બીજી ભાષાનું અનુવાદ ઉમેરવા માટે હેડર ટૉગલમાંથી ભાષા બદલો."
                                : "Switch language from the header toggle to fill the other translation."}
                        </small>
                    </div> */}

                    <Row>
                        <Col lg={12}>
                            {/* Header */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-1">
                                            {isGu
                                                ? `${swamiName} ના પદ`
                                                : `Pads of ${swamiName}`}
                                        </h5>
                                        <p className="text-muted mb-0 small">
                                            {isGu
                                                ? `કુલ પદ: ${pads.length}`
                                                : `Total Pads: ${pads.length}`}
                                        </p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Link
                                            href={route(
                                                "role.category.adjectivelist",
                                                {
                                                    rolePrefix: rolePrefix,
                                                },
                                            )}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <i className="ri-arrow-left-line me-1"></i>
                                            {isGu ? "પાછળ જાઓ" : "Back"}
                                        </Link>
                                    </div>
                                </Card.Header>
                            </Card>

                            {/* Pads List */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0 fw-semibold">
                                        <i className="ri-music-2-line me-1"></i>
                                        {isGu ? "પદની યાદી" : "Pads List"}
                                    </h6>

                                    {/* Mass delete button — only shows when rows are selected */}
                                    {selectedIds.length > 0 && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={deleting}
                                            onClick={handleMassDelete}
                                        >
                                            <i className="ri-delete-bin-line me-1"></i>
                                            {isGu
                                                ? `પસંદ કરેલા ડિલીટ કરો (${selectedIds.length})`
                                                : `Delete Selected (${selectedIds.length})`}
                                        </Button>
                                    )}
                                </Card.Header>
                                <Card.Body className="p-0">
                                    {pads.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            {isGu
                                                ? "આ વિશેષણ સાથે કોઈ પદ જોડાયેલ નથી."
                                                : "No pads found for this Adjective."}
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
                                                                    if (el)
                                                                        el.indeterminate =
                                                                            someSelected;
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
                                                            #
                                                        </th>
                                                        <th>
                                                            {isGu
                                                                ? "શીર્ષક"
                                                                : "Title"}
                                                        </th>
                                                        <th>
                                                            {isGu
                                                                ? "સ્થિતિ"
                                                                : "Status"}
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
                                                    {pads.map((pad, index) => {
                                                        const title =
                                                            t(
                                                                pad.title,
                                                                locale,
                                                            ) ||
                                                            (isGu
                                                                ? "શીર્ષક વગર"
                                                                : "Untitled");
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
                                                                            "admin.pads.show",
                                                                            pad.id,
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
                                                                        isGu={
                                                                            isGu
                                                                        }
                                                                    />
                                                                </td>
                                                                <td>
                                                                    {formatDate(
                                                                        pad.establish_date,
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
                                                                <td className="text-end">
                                                                    <div className="d-flex gap-1 justify-content-end">
                                                                        <Link
                                                                            href={route(
                                                                                "admin.pads.show",
                                                                                pad.id,
                                                                            )}
                                                                            className="btn btn-soft-info btn-sm"
                                                                            title={
                                                                                isGu
                                                                                    ? "જુઓ"
                                                                                    : "View"
                                                                            }
                                                                        >
                                                                            <i className="ri-eye-fill"></i>
                                                                        </Link>
                                                                        <Link
                                                                            href={route(
                                                                                "admin.pads.edit",
                                                                                pad.id,
                                                                            )}
                                                                            className="btn btn-soft-warning btn-sm"
                                                                            title={
                                                                                isGu
                                                                                    ? "ફેરફાર"
                                                                                    : "Edit"
                                                                            }
                                                                        >
                                                                            <i className="ri-pencil-fill"></i>
                                                                        </Link>
                                                                        {/* Single delete button */}
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-soft-danger btn-sm"
                                                                            title={
                                                                                isGu
                                                                                    ? "ડિલીટ કરો"
                                                                                    : "Delete"
                                                                            }
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

AdjectivesShowPads.layout = (page: any) => <Layout children={page} />;
export default AdjectivesShowPads;
