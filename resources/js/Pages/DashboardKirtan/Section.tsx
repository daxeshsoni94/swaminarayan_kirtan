import React, { useMemo } from "react";

import { Col, Row } from "react-bootstrap";

import { Link, usePage } from "@inertiajs/react";

interface SectionProps {
    rightClickBtn?: () => void;
}

interface PageProps {
    locale?: string;
    translations?: Record<string, any>;
    auth?: {
        user?: {
            name?: string | Record<string, string> | null;
            role?: {
                name?: string;
            };
        };
    };
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

const Section = ({ rightClickBtn }: SectionProps) => {
    const { locale, translations = {}, auth } = usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const username = tValue(auth?.user?.name, currentLocale);

    return (
        <React.Fragment>
            <Row className="mb-3 pb-1">
                <Col xs={12}>
                    <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                        <div className="flex-grow-1">
                            <h4 className="fs-16 mb-1">
                                {tr("jai_swaminarayan")}! {username}
                            </h4>

                            <p className="text-muted mb-0">
                                {tr("dashboard_kirtan_message")}
                            </p>
                        </div>

                        <div className="mt-3 mt-lg-0">
                            <form action="#">
                                <Row className="g-3 mb-0 align-items-center">
                                    <div className="col-sm-auto">
                                        {/*
                                        Date filter can be enabled later.

                                        <div className="input-group">
                                            <Flatpickr
                                                className="form-control border-0 dash-filter-picker shadow"
                                                options={{
                                                    mode: "range",
                                                    dateFormat: "d M, Y",
                                                    defaultDate: [
                                                        new Date(
                                                            new Date().getFullYear(),
                                                            new Date().getMonth(),
                                                            1,
                                                        ),
                                                        new Date(),
                                                    ],
                                                }}
                                            />

                                            <div className="input-group-text bg-primary border-primary text-white">
                                                <i className="ri-calendar-2-line"></i>
                                            </div>
                                        </div>
                                        */}
                                    </div>

                                    <div className="col-auto">
                                        <Link
                                            href={route("role.pads.create", {
                                                rolePrefix: rolePrefix,
                                            })}
                                            className="btn btn-soft-success"
                                        >
                                            <i className="ri-add-circle-line align-middle me-1"></i>{" "}
                                            {tr("add_kirtan")}
                                        </Link>
                                    </div>

                                    {/*
                                    Right-side button can be enabled later.

                                    <div className="col-auto">
                                        <button
                                            type="button"
                                            className="btn btn-soft-info btn-icon waves-effect waves-light layout-rightside-btn"
                                            onClick={rightClickBtn}
                                        >
                                            <i className="ri-pulse-line"></i>
                                        </button>
                                    </div>
                                    */}
                                </Row>
                            </form>
                        </div>
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default Section;
