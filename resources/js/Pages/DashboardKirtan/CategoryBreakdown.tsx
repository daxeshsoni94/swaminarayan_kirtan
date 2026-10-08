import React, { useMemo } from "react";

import { Card, Col } from "react-bootstrap";

import { CategoryVisitsCharts } from "./DashboardKirtanCharts";

import { usePage } from "@inertiajs/react";

interface CategoryBreakdownProps {
    data?: {
        labels: string[];
        series: number[];
    };
}

interface PageProps {
    locale: string;
    translations?: Record<string, any>;
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

const CategoryBreakdown = ({ data }: CategoryBreakdownProps) => {
    const { locale, translations = {} } = usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const getTranslatedLabel = (value: string): string => {
        if (!value) {
            return "";
        }

        try {
            const parsed = JSON.parse(value);

            if (
                typeof parsed === "object" &&
                parsed !== null &&
                !Array.isArray(parsed)
            ) {
                return (
                    parsed[currentLocale] ??
                    parsed["en"] ??
                    Object.values(parsed)[0] ??
                    value
                );
            }

            return value;
        } catch {
            return value;
        }
    };

    const translatedLabels =
        data?.labels?.map((label) => getTranslatedLabel(label)) ?? [];

    return (
        <React.Fragment>
            <Col xl={4}>
                <Card className="card-height-100">
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">
                            {tr("content_by_category_type")}
                        </h4>
                    </Card.Header>

                    <Card.Body>
                        <CategoryVisitsCharts
                            dataColors='["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]'
                            labels={translatedLabels}
                            series={data?.series}
                        />
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default CategoryBreakdown;
