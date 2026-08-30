// resources/js/Pages/Admin/Pads/Show.jsx

import React, { useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Layout from "../../../Layouts";
import { toast } from "react-toastify";
import { usePermission } from "../../../hooks/usePermission";

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

const groupCategories = (categories: any[] = [], locale: string) =>
    categories.reduce((acc: Record<string, string[]>, c) => {
        const type = t(c.type, locale);
        const value = t(c.value, locale);
        if (!type) return acc;
        if (!acc[type]) acc[type] = [];
        if (value) acc[type].push(value);
        return acc;
    }, {});

const storageUrl = (fileUrl: string | null | undefined) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http") || fileUrl.startsWith("/storage/")) {
        return fileUrl;
    }
    return `/storage/${String(fileUrl).replace(/^\//, "")}`;
};

// ─── Single Version Block ─────────────────────────────────────────────────────
const RecordedVersionBlock = ({
    recording,
    index,
    isGu,
    locale,
}: {
    recording: any;
    index: number;
    isGu: boolean;
    locale: string;
}) => {
    const fileUrl = storageUrl(recording?.file_url);

    const fileName = fileUrl
        ? decodeURIComponent(
              new URL(fileUrl, window.location.origin).pathname
                  .split("/")
                  .pop() || "",
          )
        : "";

    return (
        <div
            className="border rounded p-3 mb-3"
            style={{ background: "#f8f9fa" }}
        >
            <h6 className="fw-semibold mb-3">
                {isGu ? `સંસ્કરણ #${index + 1}` : `Version #${index + 1}`}
                {recording.id && (
                    <span
                        className="badge bg-secondary ms-2"
                        style={{ fontSize: "10px" }}
                    >
                        ID #{recording.id}
                    </span>
                )}
            </h6>

            <Row className="g-3" style={{ fontSize: "13px" }}>
                <Col md={4}>
                    <span className="fw-semibold text-dark">
                        {isGu ? "મીડિયા પ્રકાર: " : "Media Type: "}
                    </span>
                    {recording.media_type === "audio"
                        ? isGu
                            ? "ઑડિયો"
                            : "Audio"
                        : recording.media_type === "video"
                          ? isGu
                              ? "વિડિયો"
                              : "Video"
                          : recording.media_type || "—"}
                </Col>

                <Col md={4}>
                    <span className="fw-semibold text-dark">
                        {isGu ? "રેકોર્ડિંગ પ્રકાર: " : "Recording Type: "}
                    </span>
                    {recording.recording_type === "live"
                        ? isGu
                            ? "લાઈવ"
                            : "Live"
                        : recording.recording_type === "studio"
                          ? isGu
                              ? "સ્ટુડિયો"
                              : "Studio"
                          : recording.recording_type || "—"}
                </Col>

                <Col md={4}>
                    <span className="fw-semibold text-dark">
                        {isGu ? "ગાયક: " : "Singer: "}
                    </span>
                    {t(recording.singer, locale) || "—"}
                </Col>

                <Col md={4}>
                    <span className="fw-semibold text-dark">
                        {isGu ? "પ્રકાશક: " : "Publisher: "}
                    </span>
                    {t(recording.publisher, locale) || "—"}
                </Col>

                <Col md={4}>
                    <span className="fw-semibold text-dark">
                        {isGu ? "ઉચ્ચારણ: " : "Vocalization: "}
                    </span>
                    {t(recording.vocalization, locale) || "—"}
                </Col>

                <Col md={12}>
                    {fileUrl ? (
                        <div>
                            <span className="fw-semibold text-dark d-block mb-2">
                                {isGu ? "મીડિયા:" : "Media:"}
                            </span>
                            <div className="mb-2">
                                <span className="text-muted small">
                                    {isGu ? "ફાઈલ નામ:" : "File name:"}{" "}
                                </span>
                                <span className="fw-semibold small">
                                    {fileName}
                                </span>
                            </div>

                            {recording.media_type === "video" ? (
                                <video
                                    controls
                                    src={fileUrl}
                                    className="w-100 rounded"
                                    style={{ maxHeight: 320 }}
                                />
                            ) : (
                                <audio
                                    controls
                                    src={fileUrl}
                                    className="w-100"
                                />
                            )}

                            <div className="mt-2">
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="small"
                                >
                                    {isGu ? "ફાઈલ ખોલો" : "Open file"}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted">
                            {isGu
                                ? "કોઈ ફાઈલ અપલોડ કરેલ નથી."
                                : "No file uploaded."}
                        </span>
                    )}
                </Col>
            </Row>
        </div>
    );
};

// ─── Show ─────────────────────────────────────────────────────────────────────
const Show = ({
    pad,
    is_favorited = false,
}: {
    pad: any;
    is_favorited?: boolean;
}) => {
    const page = usePage().props as { locale?: string };
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const isGu = locale === "gu";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const { can } = usePermission();
    const canEdit = can("pads", "edit");

    const [isFavorited, setIsFavorited] = useState(is_favorited);
    const [loading, setLoading] = useState(false);

    const categoriesByType = groupCategories(pad?.categories ?? [], locale);

    // Support both old singular and new plural
    const recordings: any[] = Array.isArray(pad?.recorded_versions)
        ? pad.recorded_versions
        : pad?.recorded_version
          ? [pad.recorded_version]
          : [];

    const displayTitle =
        t(pad?.title, locale) || (isGu ? "પદની વિગતો" : "Pad Details");
    const displayLyrics = t(pad?.value, locale);

    const handleToggleFavorite = () => {
        if (loading) return;

        setLoading(true);

        router.post(
            route("role.pads.toggle-favorite", {
                rolePrefix: rolePrefix,
                pad: pad.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    const newStatus =
                        page.props.flash?.is_favorited ?? !isFavorited;

                    setIsFavorited(newStatus);
                    setLoading(false);

                    toast.success(
                        newStatus
                            ? isGu
                                ? "પદ મનપસંદમાં ઉમેરાયું."
                                : "Added to favorites."
                            : isGu
                              ? "પદ મનપસંદમાંથી દૂર કર્યું."
                              : "Removed from favorites.",
                    );
                },
                onError: () => {
                    setLoading(false);

                    toast.error(
                        isGu ? "કંઈક ખોટું થયું." : "Something went wrong.",
                    );
                },
            },
        );
    };

    return (
        <React.Fragment>
            <Head title={isGu ? "પદની વિગતો" : "Pad Details"} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={displayTitle}
                        pageTitle={isGu ? "પદ" : "Pads"}
                    />

                    <Row>
                        <Col lg={12}>
                            {/* Header */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-1">
                                            {displayTitle}
                                        </h5>
                                        <StatusBadge
                                            status={pad?.status}
                                            isGu={isGu}
                                        />
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${
                                                isFavorited
                                                    ? "btn-danger"
                                                    : "btn-outline-danger"
                                            }`}
                                            onClick={handleToggleFavorite}
                                            disabled={loading}
                                            title={
                                                isFavorited
                                                    ? isGu
                                                        ? "મનપસંદમાંથી દૂર કરો"
                                                        : "Remove from favorites"
                                                    : isGu
                                                      ? "મનપસંદમાં ઉમેરો"
                                                      : "Add to favorites"
                                            }
                                        >
                                            <i
                                                className={`ri-heart-${
                                                    isFavorited
                                                        ? "fill"
                                                        : "line"
                                                }`}
                                            ></i>
                                        </button>
                                        {canEdit && (
                                            <Link
                                                href={route("role.pads.edit", {
                                                    rolePrefix: rolePrefix,
                                                    pad: pad.id,
                                                })}
                                                className="btn btn-warning btn-sm"
                                            >
                                                <i className="ri-pencil-fill me-1"></i>
                                                {isGu ? "ફેરફાર કરો" : "Edit"}
                                            </Link>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                window.history.back()
                                            }
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <i className="ri-arrow-left-line me-1"></i>
                                            {isGu ? "પાછળ જાઓ" : "Back"}
                                        </button>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Row
                                        className="g-3 text-muted"
                                        style={{ fontSize: "13px" }}
                                    >
                                        <Col sm={4}>
                                            <span className="fw-semibold text-dark">
                                                {isGu
                                                    ? "સ્થાપના તારીખ: "
                                                    : "Establish Date: "}
                                            </span>
                                            {formatDate(pad?.establish_date)}
                                        </Col>
                                        <Col sm={4}>
                                            <span className="fw-semibold text-dark">
                                                {isGu
                                                    ? "બનાવ્યું: "
                                                    : "Created: "}
                                            </span>
                                            {formatDate(pad?.created_at)}
                                        </Col>
                                        <Col sm={4}>
                                            <span className="fw-semibold text-dark">
                                                {isGu
                                                    ? "છેલ્લે અપડેટ: "
                                                    : "Last Updated: "}
                                            </span>
                                            {formatDate(pad?.updated_at)}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Lyrics */}
                            <Card>
                                <Card.Header>
                                    <h6 className="mb-0 fw-semibold">
                                        <i className="ri-music-2-line me-1"></i>
                                        {isGu ? "ગીત" : "Lyrics"}
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <div
                                        className="p-3 rounded border"
                                        style={{
                                            background: "var(--vz-light)",
                                            whiteSpace: "pre-wrap",
                                            fontSize: "14px",
                                            lineHeight: "1.8",
                                        }}
                                    >
                                        {displayLyrics || (
                                            <span className="text-muted">
                                                {isGu
                                                    ? "કોઈ ગીત ઉપલબ્ધ નથી."
                                                    : "No lyrics available."}
                                            </span>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Categories */}
                            {Object.keys(categoriesByType).length > 0 && (
                                <Card>
                                    <Card.Header>
                                        <h6 className="mb-0 fw-semibold">
                                            <i className="ri-price-tag-3-line me-1"></i>
                                            {isGu ? "શ્રેણીઓ" : "Categories"}
                                        </h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="d-flex flex-wrap gap-2">
                                            {Object.entries(
                                                categoriesByType,
                                            ).map(([type, values]) => (
                                                <div
                                                    key={type}
                                                    className="border rounded px-2 py-1"
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    <span className="fw-semibold text-muted me-1">
                                                        {type}:
                                                    </span>
                                                    {(values as string[]).map(
                                                        (v, i) => (
                                                            <span
                                                                key={i}
                                                                className="badge bg-info-subtle text-info me-1"
                                                            >
                                                                {v}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Recorded Versions (multiple) */}
                            <Card>
                                <Card.Header>
                                    <h6 className="mb-0 fw-semibold">
                                        <i className="ri-mic-line me-1"></i>
                                        {isGu
                                            ? "રેકોર્ડ કરેલ સંસ્કરણો"
                                            : "Recorded Versions"}
                                        {recordings.length > 0 && (
                                            <span
                                                className="badge bg-primary ms-2"
                                                style={{ fontSize: "10px" }}
                                            >
                                                {recordings.length}
                                            </span>
                                        )}
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    {recordings.length === 0 ? (
                                        <p className="text-muted mb-0">
                                            {isGu
                                                ? "કોઈ રેકોર્ડિંગ જોડાયેલ નથી."
                                                : "No recording attached."}
                                        </p>
                                    ) : (
                                        recordings.map((recording, index) => (
                                            <RecordedVersionBlock
                                                key={recording.id ?? index}
                                                recording={recording}
                                                index={index}
                                                isGu={isGu}
                                                locale={locale}
                                            />
                                        ))
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

Show.layout = (page: any) => <Layout children={page} />;
export default Show;
