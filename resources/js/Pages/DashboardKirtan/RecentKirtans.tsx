import React, { useMemo } from "react";

import { Card, Col } from "react-bootstrap";

import { Link, usePage } from "@inertiajs/react";

import { gujaratiNumber } from "../../utils/number";

interface RecentPad {
    id: number;
    title: string | Record<string, string> | null;
    status: string;
    statusClass: string;
    by: string | Record<string, string> | null;
    date: string | number;
}

interface Props {
    items: RecentPad[];
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
// const tValue = (
//     value: string | Record<string, string> | null | undefined,
//     locale: string,
// ): string => {
//     if (value == null) {
//         return "";
//     }

//     if (typeof value === "string") {
//         return value;
//     }

//     return value[locale] ?? value["en"] ?? Object.values(value)[0] ?? "";
// };

const getTranslatedRole = (
    value: string | Record<string, string> | null | undefined,
    locale: string,
    translations: Record<string, any>,
): string => {
    if (!value) {
        return "";
    }

    // If database already contains multilingual value
    if (typeof value === "object") {
        return value[locale] ?? value.en ?? Object.values(value)[0] ?? "";
    }

    // If database contains "Admin", "User", "Vendor", etc.
    const roleKey = `role_${value.toLowerCase().trim().replace(/\s+/g, "-")}`;

    return translations[roleKey] ?? value;
};
const RecentKirtans = ({ items }: Props) => {
    const { locale, translations = {}, auth } = usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    return (
        <React.Fragment>
            <Col xl={8}>
                <Card>
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">
                            {tr("recent_kirtans")}
                        </h4>

                        <div className="flex-shrink-0">
                            <Link
                                href={route("role.pads.list", {
                                    rolePrefix: rolePrefix,
                                })}
                                className="btn btn-soft-info btn-sm"
                            >
                                <i className="ri-file-list-3-line align-middle"></i>{" "}
                                {tr("view_all")}
                            </Link>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <div className="table-responsive table-card">
                            <table className="table table-borderless table-centered align-middle table-nowrap mb-0">
                                <thead className="text-muted table-light">
                                    <tr>
                                        <th scope="col">{tr("id")}</th>

                                        <th scope="col">{tr("kirtan")}</th>

                                        <th scope="col">{tr("updated_by")}</th>

                                        <th scope="col">{tr("date")}</th>

                                        <th scope="col">{tr("status")}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {items.slice(0, 7).map((item, index) => (
                                        <tr key={item.id}>
                                            <td>
                                                <Link
                                                    href={route(
                                                        "role.pads.edit",
                                                        {
                                                            rolePrefix:
                                                                rolePrefix,
                                                            pad: item.id,
                                                        },
                                                    )}
                                                    className="fw-medium link-primary"
                                                >
                                                    
                                                    {gujaratiNumber(
                                                        index + 1,
                                                        currentLocale,
                                                    )}
                                                </Link>
                                            </td>

                                            <td>
                                                {truncate(
                                                    getTranslatedRole(
                                                        item.title,
                                                        currentLocale,
                                                        translations,
                                                    ),
                                                )}
                                            </td>

                                            <td>
                                                <td>
                                                    {getTranslatedRole(
                                                        item.by,
                                                        currentLocale,
                                                        translations,
                                                    )}
                                                </td>
                                            </td>

                                            <td>
                                                {gujaratiNumber(
                                                    item.date,
                                                    currentLocale,
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        "badge bg-" +
                                                        item.statusClass +
                                                        "-subtle text-" +
                                                        item.statusClass
                                                    }
                                                >
                                                    {item.status === "Published"
                                                        ? tr("published")
                                                        : item.status ===
                                                            "Draft"
                                                          ? tr("draft")
                                                          : item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default RecentKirtans;
