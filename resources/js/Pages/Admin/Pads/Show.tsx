import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Modal, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

import { Head, Link, router, usePage } from "@inertiajs/react";

import Layout from "../../../Layouts";

import { usePermission } from "../../../hooks/usePermission";

import { gujaratiNumber } from "../../../utils/number";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

// ─────────────────────────────────────────────────────────────────────────────
// Central Translator
// ─────────────────────────────────────────────────────────────────────────────

const createTranslator = (
    translations: Record<string, any>,
): TranslationFunction => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ): string => {
        let text = translations[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(new RegExp(`:${name}`, "g"), String(value));
        });

        return text;
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic DB Translation
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
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({
    status,
    tr,
}: {
    status?: string;
    tr: TranslationFunction;
}) => {
    const key = (status || "").toLowerCase();

    const classMap: Record<string, string> = {
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
    }

    return (
        <span
            className={
                classMap[key] ??
                "badge bg-secondary-subtle text-secondary text-uppercase"
            }
        >
            {label}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Date Formatter
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (value: any, locale: string): string => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const parts = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).formatToParts(date);

    const day = parts.find((part) => part.type === "day")?.value ?? "";
    const month = parts.find((part) => part.type === "month")?.value ?? "";
    const year = parts.find((part) => part.type === "year")?.value ?? "";

    const formatted = `${day}-${month}-${year}`;

    return gujaratiNumber(formatted, locale);
};

// ─────────────────────────────────────────────────────────────────────────────
// Group Categories
// ─────────────────────────────────────────────────────────────────────────────

const groupCategories = (categories: any[] = [], locale: string) =>
    categories.reduce((acc: Record<string, string[]>, category: any) => {
        const type = tValue(category.type, locale);
        const value = tValue(category.value, locale);

        if (!type) {
            return acc;
        }

        if (!acc[type]) {
            acc[type] = [];
        }

        if (value) {
            acc[type].push(value);
        }

        return acc;
    }, {});

// ─────────────────────────────────────────────────────────────────────────────
// Storage URL
// ─────────────────────────────────────────────────────────────────────────────

const storageUrl = (fileUrl: string | null | undefined): string | null => {
    if (!fileUrl) {
        return null;
    }

    if (fileUrl.startsWith("http") || fileUrl.startsWith("/storage/")) {
        return fileUrl;
    }

    return `/storage/${String(fileUrl).replace(/^\/+/, "")}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Recorded Version Block
// ─────────────────────────────────────────────────────────────────────────────

const RecordedVersionBlock = ({
    recording,
    index,
    locale,
    tr,
}: {
    recording: any;
    index: number;
    locale: string;
    tr: TranslationFunction;
}) => {
    const [showYoutubeModal, setShowYoutubeModal] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);

    const fileUrl = storageUrl(recording?.file_url);

    const fileName = fileUrl
        ? (() => {
              const fullName = decodeURIComponent(
                  new URL(fileUrl, window.location.origin).pathname
                      .split("/")
                      .pop() || "",
              );

              // Remove the uniqid prefix (everything before the first underscore)
              // Example: 6aa13da3d1e71_bochok05-free-beats-13026.mp3
              //       → bochok05-free-beats-13026.mp3
              const underscoreIndex = fullName.indexOf("_");
              if (underscoreIndex > 0) {
                  return fullName.substring(underscoreIndex + 1);
              }

              return fullName;
          })()
        : "";

    const mediaType =
        recording?.media_type === "audio"
            ? tr("audio")
            : recording?.media_type === "video"
              ? tr("video")
              : recording?.media_type || "—";

    const recordingType =
        recording?.recording_type === "live"
            ? tr("live")
            : recording?.recording_type === "studio"
              ? tr("studio")
              : recording?.recording_type || "—";

    return (
        <div className="border rounded p-3 mb-3">
            <h6 className="fw-semibold mb-3">
                {tr("version", {
                    number: gujaratiNumber(index + 1, locale),
                })}
            </h6>

            <Row className="g-3" style={{ fontSize: "13px" }}>
                <Col md={4}>
                    <span className="fw-semibold text-body">
                        {tr("media_type")}:{" "}
                    </span>
                    {mediaType}
                </Col>

                <Col md={4}>
                    <span className="fw-semibold text-body">
                        {tr("recording_type")}:{" "}
                    </span>
                    {recordingType}
                </Col>

                <Col md={4}>
                    <span className="fw-semibold text-body">
                        {tr("singer")}:{" "}
                    </span>
                    {tValue(recording?.singer, locale) || "—"}
                </Col>

                <Col md={4}>
                    <span className="fw-semibold text-body">
                        {tr("publisher")}:{" "}
                    </span>
                    {tValue(recording?.publisher, locale) || "—"}
                </Col>

                <Col md={4}>
                    <span className="fw-semibold text-body">
                        {tr("vocalization")}:{" "}
                    </span>
                    {tValue(recording?.vocalization, locale) || "—"}
                </Col>

                <Col md={4}>
                    <span className="fw-semibold text-body">
                        {tr("raga")}:{" "}
                    </span>
                    {tValue(recording?.raga, locale) || "—"}
                </Col>

                <Col md={12}>
                    {/* Render File Name if exists */}
                    {fileUrl &&
                        fileUrl !== "null" &&
                        fileUrl !== "/storage/null" && (
                            <div className="mb-2">
                                <span className="fw-semibold text-body">
                                    {tr("file_name")}:{" "}
                                </span>
                                {tValue(recording?.file_name, locale) || "—"}
                            </div>
                        )}

                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        {/* Render File Preview Button / Inline Audio if exists */}
                        {fileUrl &&
                            fileUrl !== "null" &&
                            fileUrl !== "/storage/null" && (
                                <>
                                    {recording?.media_type === "audio" ? (
                                        <div className="w-100 my-2">
                                            <audio
                                                controls
                                                src={fileUrl}
                                                className="w-100"
                                            >
                                                Your browser does not support
                                                the audio element.
                                            </audio>
                                            {/* <div className="mt-1">
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        fontSize: "12px",
                                                        textDecoration: "none",
                                                    }}
                                                >
                                                    Open file
                                                </a>
                                            </div> */}
                                        </div>
                                    ) : (
                                        <>
                                            <Button
                                                variant="info"
                                                size="sm"
                                                onClick={() =>
                                                    setShowMediaModal(true)
                                                }
                                            >
                                                <i className="ri-video-line me-1"></i>{" "}
                                                {tr("preview_media") ||
                                                    "Preview Media"}
                                            </Button>

                                            <Modal
                                                show={showMediaModal}
                                                onHide={() =>
                                                    setShowMediaModal(false)
                                                }
                                                size="lg"
                                                centered
                                            >
                                                <Modal.Header closeButton>
                                                    <Modal.Title>
                                                        {tValue(
                                                            recording?.file_name,
                                                            locale,
                                                        ) ||
                                                            tr(
                                                                "preview_media",
                                                            ) ||
                                                            "Preview Media"}
                                                    </Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body className="p-0 text-center bg-dark">
                                                    <video
                                                        controls
                                                        src={fileUrl}
                                                        className="w-100"
                                                        style={{
                                                            maxHeight: "70vh",
                                                        }}
                                                        autoPlay
                                                    />
                                                </Modal.Body>
                                            </Modal>
                                        </>
                                    )}
                                </>
                            )}

                        {/* Render YouTube Button if exists */}
                        {recording?.youtube_url &&
                            recording?.youtube_url !== "null" &&
                            (() => {
                                // Extract YouTube Video ID
                                const url = recording.youtube_url;
                                let videoId = null;
                                const match = url.match(
                                    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/,
                                );
                                if (match && match[1]) {
                                    videoId = match[1];
                                }

                                if (videoId) {
                                    return (
                                        <>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() =>
                                                    setShowYoutubeModal(true)
                                                }
                                            >
                                                <i className="ri-youtube-fill me-1"></i>{" "}
                                                Play YouTube Video
                                            </Button>

                                            <Modal
                                                show={showYoutubeModal}
                                                onHide={() =>
                                                    setShowYoutubeModal(false)
                                                }
                                                size="lg"
                                                centered
                                            >
                                                <Modal.Header closeButton>
                                                    <Modal.Title>
                                                        YouTube Video
                                                    </Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body className="p-0">
                                                    <div className="ratio ratio-16x9">
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${videoId}`}
                                                            title="YouTube video player"
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    </div>
                                                </Modal.Body>
                                            </Modal>
                                        </>
                                    );
                                } else {
                                    return (
                                        <div className="text-muted small">
                                            Invalid YouTube URL
                                        </div>
                                    );
                                }
                            })()}
                    </div>

                    {!(
                        recording?.youtube_url &&
                        recording?.youtube_url !== "null"
                    ) &&
                        !(
                            fileUrl &&
                            fileUrl !== "null" &&
                            fileUrl !== "/storage/null"
                        ) && (
                            <span className="text-muted">
                                {tr("no_file_uploaded") ||
                                    "No media available."}
                            </span>
                        )}
                </Col>
            </Row>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Show
// ─────────────────────────────────────────────────────────────────────────────

const Show = ({
    pad,
    is_favorited = false,
}: {
    pad: any;
    is_favorited?: boolean;
}) => {
    const page = usePage().props as any;

    const { auth, translations = {}, locale } = page;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const { can } = usePermission();
    const canEdit = can("pads", "edit");

    const [isFavorited, setIsFavorited] = useState(is_favorited);
    const [loading, setLoading] = useState(false);

    // Keep local state in sync when the page is re-rendered after toggle
    useEffect(() => {
        setIsFavorited(is_favorited);
    }, [is_favorited]);

    // ─────────────────────────────────────────────────────────────────────────────
    // Truncate Utility
    // ─────────────────────────────────────────────────────────────────────────────
    const truncate = (text: string, len = 60) => {
        if (!text) return "";
        return text.length > len ? text.substring(0, len) + "..." : text;
    };

    const categoriesByType = groupCategories(
        pad?.categories ?? [],
        currentLocale,
    );

    const recordings: any[] = Array.isArray(pad?.recorded_versions)
        ? pad.recorded_versions
        : pad?.recorded_version
          ? [pad.recorded_version]
          : [];

    const displayTitle = truncate(
        tValue(pad?.title, currentLocale) || tr("pad_details"),
    );
    const displayLyrics = tValue(pad?.value, currentLocale);

    const handleToggleFavorite = () => {
        if (loading) return;

        setLoading(true);

        router.post(
            route("role.pads.toggle-favorite", {
                rolePrefix,
                pad: pad.id,
            }),
            {},
            {
                preserveScroll: true,
                replace: true,

                onSuccess: () => {
                    // Optimistic update (backend will also send fresh is_favorited)
                    setIsFavorited((prev) => !prev);
                    setLoading(false);
                },

                onError: () => {
                    setLoading(false);
                },

                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    return (
        <React.Fragment>
            <Head title={tr("pad_details")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={displayTitle} pageTitle={tr("pads")} />

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
                                            tr={tr}
                                        />
                                    </div>

                                    <div className="d-flex gap-2 align-items-center">
                                        {/* Favorite */}
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
                                                    ? tr(
                                                          "remove_from_favorites",
                                                      )
                                                    : tr("add_to_favorites")
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

                                        {/* Edit */}
                                        {canEdit && (
                                            <Link
                                                href={route("role.pads.edit", {
                                                    rolePrefix,
                                                    pad: pad.id,
                                                })}
                                                className="btn btn-warning btn-sm"
                                            >
                                                <i className="ri-pencil-fill me-1"></i>
                                                {tr("edit")}
                                            </Link>
                                        )}

                                        {/* Back */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                window.history.back()
                                            }
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <i className="ri-arrow-left-line me-1"></i>
                                            {tr("back")}
                                        </button>
                                    </div>
                                </Card.Header>

                                <Card.Body>
                                    <Row
                                        className="g-3 text-muted"
                                        style={{ fontSize: "13px" }}
                                    >
                                        <Col sm={4}>
                                            <span className="fw-semibold text-body">
                                                {tr("establish_date")}:{" "}
                                            </span>
                                            {formatDate(
                                                pad?.establish_date,
                                                currentLocale,
                                            )}
                                        </Col>

                                        <Col sm={4}>
                                            <span className="fw-semibold text-body">
                                                {tr("created")}:{" "}
                                            </span>
                                            {formatDate(
                                                pad?.created_at,
                                                currentLocale,
                                            )}
                                        </Col>

                                        <Col sm={4}>
                                            <span className="fw-semibold text-body">
                                                {tr("last_updated")}:{" "}
                                            </span>
                                            {formatDate(
                                                pad?.updated_at,
                                                currentLocale,
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Lyrics */}
                            <Card>
                                <Card.Header>
                                    <h6 className="mb-0 fw-semibold">
                                        <i className="ri-music-2-line me-1"></i>
                                        {tr("lyrics")}
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
                                                {tr("no_lyrics")}
                                            </span>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Categories */}
                            {/* {Object.keys(categoriesByType).length > 0 && (
                                <Card>
                                    <Card.Header>
                                        <h6 className="mb-0 fw-semibold">
                                            <i className="ri-price-tag-3-line me-1"></i>
                                            {tr("categories")}
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
                                                        (value, index) => (
                                                            <span
                                                                key={index}
                                                                className="badge bg-info-subtle text-info me-1"
                                                            >
                                                                {value}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            )} */}

                            {/* Categories */}
                            {Object.keys(categoriesByType).length > 0 && (
                                <Card>
                                    <Card.Header>
                                        <h6 className="mb-0 fw-semibold">
                                            <i className="ri-price-tag-3-line me-1"></i>
                                            {tr("categories")}
                                        </h6>
                                    </Card.Header>

                                    <Card.Body>
                                        <div className="d-flex flex-column gap-3">
                                            {Object.entries(
                                                categoriesByType,
                                            ).map(([type, values]) => {
                                                const isLongContent = (
                                                    values as string[]
                                                ).some(
                                                    (v) => v && v.length > 80,
                                                );

                                                return (
                                                    <div
                                                        key={type}
                                                        className="border rounded p-3"
                                                        style={{
                                                            fontSize:
                                                                isLongContent
                                                                    ? "16px"
                                                                    : "14px",
                                                        }}
                                                    >
                                                        <div className="fw-semibold text-muted mb-2">
                                                            {type}
                                                        </div>

                                                        {(
                                                            values as string[]
                                                        ).map((value, index) =>
                                                            isLongContent ? (
                                                                <div
                                                                    key={index}
                                                                    className="mb-2"
                                                                    style={{
                                                                        whiteSpace:
                                                                            "pre-wrap",
                                                                        lineHeight:
                                                                            "1.7",
                                                                        background:
                                                                            "var(--vz-light)",
                                                                        padding:
                                                                            "12px",
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {value}
                                                                </div>
                                                            ) : (
                                                                <span
                                                                    key={index}
                                                                    className="badge bg-info-subtle text-info me-1 mb-1"
                                                                >
                                                                    {value}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Recorded Versions */}
                            <Card>
                                <Card.Header>
                                    <h6 className="mb-0 fw-semibold">
                                        <i className="ri-mic-line me-1"></i>
                                        {tr("recorded_versions")}
                                        {recordings.length > 0 && (
                                            <span
                                                className="badge bg-primary ms-2"
                                                style={{ fontSize: "10px" }}
                                            >
                                                {gujaratiNumber(
                                                    recordings.length,
                                                    currentLocale,
                                                )}
                                            </span>
                                        )}
                                    </h6>
                                </Card.Header>

                                <Card.Body>
                                    {recordings.length === 0 ? (
                                        <p className="text-muted mb-0">
                                            {tr("no_recording")}
                                        </p>
                                    ) : (
                                        recordings.map((recording, index) => (
                                            <RecordedVersionBlock
                                                key={recording.id ?? index}
                                                recording={recording}
                                                index={index}
                                                locale={currentLocale}
                                                tr={tr}
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

Show.layout = (page: any) => <Layout>{page}</Layout>;

export default Show;
