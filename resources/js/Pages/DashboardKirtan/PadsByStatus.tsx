import React, { useMemo } from "react";

import { usePage } from "@inertiajs/react";

import { Card, Col } from "react-bootstrap";

import { gujaratiNumber } from "../../utils/number";

interface StatusItem {
    label: string;
    value: number;
    color: string;
}

interface Props {
    data: {
        total: number;
        items: StatusItem[];
    };
}

interface PageProps {
    locale?: string;
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

const PadsByStatus = ({ data }: Props) => {
    const { locale, translations = {} } = usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const translateStatus = (label: string): string => {
        const statusKeyMap: Record<string, string> = {
            Draft: "draft",
            Published: "published",
            "With Recording": "with_recording",
            "Without Recording": "without_recording",
        };

        const key = statusKeyMap[label];

        return key ? tr(key) : label;
    };

    return (
        <Col xl={4}>
            <Card className="card-height-100">
                <Card.Header className="align-items-center d-flex">
                    <h4 className="card-title mb-0 flex-grow-1">
                        {tr("pads_by_status")}
                    </h4>
                </Card.Header>

                <Card.Body>
                    <div className="text-center mb-4">
                        <div className="avatar-md mx-auto mb-3">
                            <div className="avatar-title bg-primary-subtle text-primary display-6 rounded-circle">
                                <i className="ri-file-music-line"></i>
                            </div>
                        </div>

                        <h4 className="mb-1">
                            {gujaratiNumber(data?.total ?? 0, currentLocale)}{" "}
                            {tr("pads")}
                        </h4>

                        <p className="text-muted mb-0">
                            {tr("across_all_kirtans")}
                        </p>
                    </div>

                    <div className="px-2 py-2 mt-1">
                        {data?.items?.map((item, index) => (
                            <div key={item.label}>
                                <p
                                    className={
                                        index === 0 ? "mb-1" : "mt-3 mb-1"
                                    }
                                >
                                    {translateStatus(item.label)}

                                    <span className="float-end">
                                        {gujaratiNumber(
                                            item.value,
                                            currentLocale,
                                        )}
                                        %
                                    </span>
                                </p>

                                <div
                                    className="progress mt-2"
                                    style={{ height: "6px" }}
                                >
                                    <div
                                        className={`progress-bar progress-bar-striped bg-${item.color}`}
                                        style={{
                                            width: `${item.value}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
};

export default PadsByStatus;
