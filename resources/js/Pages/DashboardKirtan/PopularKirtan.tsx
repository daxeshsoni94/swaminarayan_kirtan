import React, { useMemo } from "react";

import { Card, Col } from "react-bootstrap";

import { Link, usePage } from "@inertiajs/react";

import { gujaratiNumber } from "../../utils/number";

interface PopularPad {
    id: number;
    title: string | Record<string, string> | null;
    date: string;
    recordings: number;
    status: string;
    categories: string;
    pads: number;
}

interface Props {
    item: PopularPad[];
    total: number;
}

interface PageProps {
    locale?: string;
    translations?: Record<string, any>;
    auth?: any;
}

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

const createTranslator = (
    translations: Record<string, any>,
): TranslationFunction => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ): string => {
        let text = translations[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = String(text).replace(
                new RegExp(`:${name}`, "g"),
                String(value),
            );
        });

        return text;
    };
};

const truncate = (text: string, len = 60) => {
    if (!text) return "";
    return text.length > len ? text.substring(0, len) + "..." : text;
};

/**
 * Get translated value from a multilingual database field.
 */
const tValue = (
    value: string | Record<string, string> | null | undefined,
    locale: string,
): string => {
    if (value == null) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    return value[locale] ?? value["en"] ?? Object.values(value)[0] ?? "";
};

const PopularKirtans = ({ item, total }: Props) => {
    const { locale, translations = {}, auth } = usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    return (
        <React.Fragment>
            <Col xl={12}>
                <Card>
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">
                            {tr("popular_kirtans")}
                        </h4>
                    </Card.Header>

                    <Card.Body>
                        <div className="table-responsive table-card">
                            <table className="table table-hover table-centered align-middle table-nowrap mb-0">
                                <tbody>
                                    {item.map((pad) => (
                                        <tr key={pad.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm bg-light rounded p-1 me-2 d-flex align-items-center justify-content-center">
                                                        <i className="ri-music-2-fill text-primary fs-18"></i>
                                                    </div>

                                                    <div>
                                                        <h5 className="fs-13 my-1">
                                                            <Link
                                                                href={route(
                                                                    "role.pads.edit",
                                                                    {
                                                                        rolePrefix:
                                                                            rolePrefix,
                                                                        pad: pad.id,
                                                                    },
                                                                )}
                                                                className="text-reset"
                                                            >
                                                                {truncate(
                                                                    tValue(
                                                                        pad.title,
                                                                        currentLocale,
                                                                    )
                                                                )}
                                                            </Link>
                                                        </h5>

                                                        <span className="text-muted">
                                                            {gujaratiNumber(
                                                                pad.date,
                                                                currentLocale,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <h5 className="fs-13 my-1 fw-normal">
                                                    {gujaratiNumber(
                                                        pad.recordings ?? 0,
                                                        currentLocale,
                                                    )}
                                                </h5>

                                                <span className="text-muted">
                                                    {tr("recordings")}
                                                </span>
                                            </td>

                                            <td>
                                                <h5 className="fs-13 my-1 fw-normal">
                                                    {pad.categories}
                                                </h5>

                                                <span className="text-muted">
                                                    {tr("category")}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        pad.status ===
                                                        "Published"
                                                            ? "badge bg-success-subtle text-success"
                                                            : "badge bg-warning-subtle text-warning"
                                                    }
                                                >
                                                    {pad.status === "Published"
                                                        ? tr("published")
                                                        : pad.status === "Draft"
                                                          ? tr("draft")
                                                          : pad.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="align-items-center mt-4 pt-2 justify-content-between row text-center text-sm-start">
                            <div className="col-sm">
                                <div className="text-muted">
                                    {tr("showing")}{" "}
                                    <span className="fw-semibold">
                                        {gujaratiNumber(
                                            item.length,
                                            currentLocale,
                                        )}
                                    </span>{" "}
                                    {tr("of")}{" "}
                                    <span className="fw-semibold">
                                        {gujaratiNumber(
                                            total ?? item.length,
                                            currentLocale,
                                        )}
                                    </span>{" "}
                                    {tr("kirtans")}
                                </div>
                            </div>

                            <div className="col-sm-auto mt-3 mt-sm-0">
                                <Link
                                    href={route("role.pads.list", {
                                        rolePrefix: rolePrefix,
                                    })}
                                    className="btn btn-soft-primary btn-sm"
                                >
                                    {tr("view_all")}
                                </Link>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default PopularKirtans;
