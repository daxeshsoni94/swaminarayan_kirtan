import { usePage } from "@inertiajs/react";
import React from "react";
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

const translations: Record<string, Record<string, string>> = {
    en: {
        "Pads by Status": "Pads by Status",
        Pads: "Pads",
        "Across all kirtans": "Across all kirtans",
        Draft: "Draft",
        Published: "Published",
        "With Recording": "With Recording",
        "Without Recording": "Without Recording",
    },

    gu: {
        "Pads by Status": "સ્થિતિ પ્રમાણે પદ",
        Pads: "પદ",
        "Across all kirtans": "તમામ કીર્તનોમાં",
        Draft: "ડ્રાફ્ટ",
        Published: "પ્રકાશિત",
        "With Recording": "રેકોર્ડિંગ સાથે",
        "Without Recording": "રેકોર્ડિંગ વગર",
    },
};

const PadsByStatus = ({ data }: Props) => {
    const { locale } = usePage<PageProps>().props;

    const tr = (key: string): string => {
        return translations[locale]?.[key] ?? translations.en[key] ?? key;
    };
    return (
        <Col xl={4}>
            <Card className="card-height-100">
                <Card.Header className="align-items-center d-flex">
                    <h4 className="card-title mb-0 flex-grow-1">
                        {tr("Pads by Status")}
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
                            {gujaratiNumber(data?.total ?? 0, locale)}{" "}
                            {tr("Pads")}
                        </h4>

                        <p className="text-muted mb-0">
                            {tr("Across all kirtans")}
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
                                    {tr(item.label)}

                                    <span className="float-end">
                                        {gujaratiNumber(item.value, locale)}%
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
