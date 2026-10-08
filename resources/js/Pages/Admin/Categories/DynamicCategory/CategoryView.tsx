import React, { useMemo } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { Head, Link, usePage } from "@inertiajs/react";
import Layout from "../../../../Layouts";
import { gujaratiNumber } from "../../../../utils/number";

const createTranslator = (translations: Record<string, any>) => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ) => {
        let text = translations?.[key] ?? key;
        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });
        return text;
    };
};

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

interface Props {
    type: string;
    typeConfig: {
        translation_key: string;
        is_custom?: boolean;
    };
    item: {
        id: number;
        value: Record<string, string>;
        type: Record<string, string>;
        created_at?: string;
        updated_at?: string;
    };
}

const CategoryView = ({ type, typeConfig, item }: Props) => {
    const page = usePage().props as any;
    const { auth, translations = {}, languages = [], locale } = page;

    const currentLocale = locale || "gu";
    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const isCustom = !!typeConfig.is_custom;

    const currentValue = item.value?.[currentLocale] || "";
    const currentType = item.type?.[currentLocale] || tr(typeConfig.translation_key);

    const displayTitle = currentValue.length > 50 
        ? currentValue.substring(0, 50) + "....." 
        : currentValue;

    return (
        <React.Fragment>
            <Head title={tr("view")} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={displayTitle} pageTitle={isCustom ? tr("custom_categories") : tr(typeConfig.translation_key)} />

                    <Row>
                        <Col lg={12}>
                            {/* Header */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-1">
                                            {displayTitle}
                                        </h5>
                                    </div>

                                    <div className="d-flex gap-2 align-items-center">
                                        {/* Edit */}
                                        <Link
                                            href={route("role.category.edit", {
                                                rolePrefix,
                                                type,
                                                category: item.id,
                                            })}
                                            className="btn btn-warning btn-sm"
                                        >
                                            <i className="ri-pencil-fill me-1"></i>
                                            {tr("edit")}
                                        </Link>

                                        {/* Back */}
                                        <Link
                                            href={route("role.category.list", {
                                                rolePrefix,
                                                type,
                                            })}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <i className="ri-arrow-left-line me-1"></i>
                                            {tr("back")}
                                        </Link>
                                    </div>
                                </Card.Header>

                                <Card.Body>
                                    <Row
                                        className="g-3 text-muted"
                                        style={{ fontSize: "13px" }}
                                    >
                                        <Col sm={4}>
                                            <span className="fw-semibold text-body">
                                                {tr("establish_date", { default: "Establish Date" })}:{" "}
                                            </span>
                                            {formatDate(
                                                item.created_at,
                                                currentLocale,
                                            )}
                                        </Col>

                                        <Col sm={4}>
                                            <span className="fw-semibold text-body">
                                                {tr("created", { default: "Created" })}:{" "}
                                            </span>
                                            {formatDate(
                                                item.created_at,
                                                currentLocale,
                                            )}
                                        </Col>

                                        <Col sm={4}>
                                            <span className="fw-semibold text-body">
                                                {tr("last_updated", { default: "Last Updated" })}:{" "}
                                            </span>
                                            {formatDate(
                                                item.updated_at,
                                                currentLocale,
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Value / Main Detail */}
                            <Card>
                                <Card.Header>
                                    <h6 className="mb-0 fw-semibold">
                                        <i className="ri-list-check me-1"></i>
                                        {currentType}
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
                                        {currentValue}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

CategoryView.layout = (page: any) => <Layout children={page} />;
export default CategoryView;
