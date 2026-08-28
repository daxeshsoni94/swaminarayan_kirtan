// resources/js/Pages/Admin/Kirtans/Show.jsx

import React from "react";
import { Badge, Card, Col, Container, Row, Table } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Head, Link } from "@inertiajs/react";
import Layout from "../../../Layouts";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        active: "badge bg-success-subtle text-success text-uppercase",
        inactive: "badge bg-danger-subtle text-danger text-uppercase",
        draft: "badge bg-warning-subtle text-warning text-uppercase",
        published: "badge bg-success-subtle text-success text-uppercase",
    };
    return (
        <span
            className={
                map[status?.toLowerCase()] ??
                "badge bg-secondary-subtle text-secondary text-uppercase"
            }
        >
            {status}
        </span>
    );
};

// ─── Recorded Version ─────────────────────────────────────────────────────────
const RecordedVersion = ({ media }) => {
    if (!media) return null;

    const hasPlayableFile = !!media.file_url;
    const fileUrl = media.file_url ? `/storage/${media.file_url}` : null;

    return (
        <div className="mb-3">
            <p className="fw-semibold mb-2" style={{ fontSize: "13px" }}>
                Recorded Version
            </p>
            <div
                className="p-3 rounded border"
                style={{ background: "var(--vz-light)" }}
            >
                {hasPlayableFile && (
                    <div className="mb-3">
                        {media.media_type === "video" ? (
                            <video
                                controls
                                className="w-100"
                                style={{ maxHeight: "300px" }}
                            >
                                <source src={fileUrl} />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <audio controls className="w-100">
                                <source src={fileUrl} />
                                Your browser does not support the audio tag.
                            </audio>
                        )}
                    </div>
                )}

                <Row className="g-2" style={{ fontSize: "13px" }}>
                    {media.media_type && (
                        <Col sm={6} md={3}>
                            <span className="fw-semibold text-dark">
                                Type:{" "}
                            </span>
                            <span className="text-uppercase text-muted">
                                {media.media_type}
                            </span>
                        </Col>
                    )}
                    {media.recording_type && (
                        <Col sm={6} md={3}>
                            <span className="fw-semibold text-dark">
                                Recording:{" "}
                            </span>
                            <span className="text-uppercase text-muted">
                                {media.recording_type}
                            </span>
                        </Col>
                    )}
                    {media.singer && (
                        <Col sm={6} md={3}>
                            <span className="fw-semibold text-dark">
                                Singer:{" "}
                            </span>
                            <span className="text-muted">{media.singer}</span>
                        </Col>
                    )}
                    {media.publisher && (
                        <Col sm={6} md={3}>
                            <span className="fw-semibold text-dark">
                                Publisher:{" "}
                            </span>
                            <span className="text-muted">
                                {media.publisher}
                            </span>
                        </Col>
                    )}
                    {media.vocalization && (
                        <Col sm={6} md={3}>
                            <span className="fw-semibold text-dark">
                                Vocalization:{" "}
                            </span>
                            <span className="text-muted">
                                {media.vocalization}
                            </span>
                        </Col>
                    )}
                </Row>
            </div>
        </div>
    );
};

// ─── Show ─────────────────────────────────────────────────────────────────────
const Show = ({ kirtan }) => {
    return (
        <React.Fragment>
            <Head title={kirtan.title} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={kirtan.title} pageTitle="Kirtans" />

                    <Row>
                        <Col lg={12}>
                            {/* Kirtan Header Card */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-1">
                                            {kirtan.title}
                                        </h5>
                                        <StatusBadge status={kirtan.status} />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Link
                                            href={route(
                                                "admin.kirtans.edit",
                                                kirtan.id,
                                            )}
                                            className="btn btn-warning btn-sm"
                                        >
                                            <i className="ri-pencil-fill me-1"></i>
                                            Edit
                                        </Link>
                                        <Link
                                            href={route("admin.pads.list")}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <i className="ri-arrow-left-line me-1"></i>
                                            Back
                                        </Link>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Row
                                        className="g-3 text-muted"
                                        style={{ fontSize: "13px" }}
                                    >
                                        <Col sm={4}>
                                            <span className="fw-semibold text-dark">
                                                Total Pads:{" "}
                                            </span>
                                            <span className="badge bg-primary-subtle text-primary ms-1">
                                                {kirtan.pads?.length ?? 0} Pads
                                            </span>
                                        </Col>
                                        <Col sm={4}>
                                            <span className="fw-semibold text-dark">
                                                Created:{" "}
                                            </span>
                                            {new Date(
                                                kirtan.created_at,
                                            ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </Col>
                                        <Col sm={4}>
                                            <span className="fw-semibold text-dark">
                                                Last Updated:{" "}
                                            </span>
                                            {new Date(
                                                kirtan.updated_at,
                                            ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Pads */}
                            {(kirtan.pads ?? []).length === 0 ? (
                                <Card>
                                    <Card.Body className="text-center py-5 text-muted">
                                        <i className="bx bx-music display-5 d-block mb-2"></i>
                                        <p className="mb-3">
                                            No pads added yet.
                                        </p>
                                        <Link
                                            href={route(
                                                "admin.kirtans.edit",
                                                kirtan.id,
                                            )}
                                            className="btn btn-outline-success btn-sm"
                                        >
                                            + Add Pads
                                        </Link>
                                    </Card.Body>
                                </Card>
                            ) : (
                                (kirtan.pads ?? []).map((pad, index) => (
                                    <Card key={pad.id}>
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-2">
                                                <span
                                                    className="badge bg-primary"
                                                    style={{ fontSize: "11px" }}
                                                >
                                                    Pad {index + 1}
                                                </span>
                                                <h6 className="mb-0 fw-semibold">
                                                    {pad.title}
                                                </h6>
                                                <StatusBadge
                                                    status={pad.status}
                                                />
                                            </div>
                                            {pad.establish_date && (
                                                <small className="text-muted">
                                                    <i className="ri-calendar-line me-1"></i>
                                                    {new Date(
                                                        pad.establish_date,
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </small>
                                            )}
                                        </Card.Header>
                                        <Card.Body>
                                            {/* Lyrics */}
                                            <div
                                                className="p-3 rounded border mb-3"
                                                style={{
                                                    background:
                                                        "var(--vz-light)",
                                                    whiteSpace: "pre-wrap",
                                                    fontSize: "14px",
                                                    lineHeight: "1.8",
                                                }}
                                            >
                                                {pad.value}
                                            </div>

                                            {/* Recorded Version */}
                                            <RecordedVersion
                                                media={pad.recorded_version}
                                            />
                                            {console.log(
                                                "pad recorded_version:",
                                                pad.recorded_version,
                                            )}
                                            {/* Categories */}
                                            {(pad.categories ?? []).length >
                                                0 && (
                                                <div>
                                                    <p
                                                        className="fw-semibold mb-2"
                                                        style={{
                                                            fontSize: "13px",
                                                        }}
                                                    >
                                                        Categories
                                                    </p>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {Object.entries(
                                                            pad.categories.reduce(
                                                                (acc, c) => {
                                                                    if (
                                                                        !acc[
                                                                            c
                                                                                .type
                                                                        ]
                                                                    )
                                                                        acc[
                                                                            c.type
                                                                        ] = [];
                                                                    acc[
                                                                        c.type
                                                                    ].push(
                                                                        c.value,
                                                                    );
                                                                    return acc;
                                                                },
                                                                {},
                                                            ),
                                                        ).map(
                                                            ([
                                                                type,
                                                                values,
                                                            ]) => (
                                                                <div
                                                                    key={type}
                                                                    className="border rounded px-2 py-1"
                                                                    style={{
                                                                        fontSize:
                                                                            "12px",
                                                                    }}
                                                                >
                                                                    <span className="fw-semibold text-muted me-1">
                                                                        {type}:
                                                                    </span>
                                                                    {values.map(
                                                                        (
                                                                            v,
                                                                            i,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className="badge bg-info-subtle text-info me-1"
                                                                            >
                                                                                {
                                                                                    v
                                                                                }
                                                                            </span>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                ))
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

Show.layout = (page) => <Layout children={page} />;
export default Show;
