import React, { useMemo } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { ActivityCharts } from "./DashboardKirtanCharts";
import CountUp from "react-countup";
import { usePage } from "@inertiajs/react";
import { gujaratiNumber } from "../../utils/number";

type Stats = {
    total_pads?: number;
    total_recordings?: number;
    total_drafts?: number;
    published_percent?: number;
};

type Activity = {
    categories?: string[];
    series?: {
        name: string;
        type: string;
        data: number[];
    }[];
};

const ActivityOverview = ({
    stats = {},
    activity = {},
}: {
    stats?: Stats;
    activity?: Activity;
}) => {
    const page = usePage().props as any;
    const { locale, translations = {} } = page;
    const t = translations;

    const chartData = useMemo(() => {
        if (activity?.series?.length) {
            return activity.series;
        }

        // Empty fallback (12 months)
        return [
            {
                name: t.pads || "Pads",
                type: "bar",
                data: Array(12).fill(0),
            },
        ];
    }, [activity, t]);

    return (
        <React.Fragment>
            <Card>
                <Card.Header className="border-0 align-items-center d-flex">
                    <h4 className="card-title mb-0 flex-grow-1">
                        {t.library_activity}
                    </h4>
                    <div className="d-flex gap-1">
                        <button
                            type="button"
                            className="btn btn-soft-primary btn-sm"
                        >
                            {gujaratiNumber(1, locale)} Y
                        </button>
                    </div>
                </Card.Header>

                <Card.Header className="p-0 border-0 bg-light-subtle">
                    <Row className="g-0 text-center">
                        <Col xs={6} sm={4}>
                            <div className="p-3 border border-dashed border-start-0">
                                <h5 className="mb-1">
                                    <CountUp
                                        start={0}
                                        end={stats.total_pads ?? 0}
                                        duration={2}
                                        separator=","
                                        formattingFn={(value) =>
                                            gujaratiNumber(
                                                Math.round(value),
                                                locale,
                                            )
                                        }
                                    />
                                </h5>
                                <p className="text-muted mb-0">{t.pads}</p>
                            </div>
                        </Col>

                        <Col xs={6} sm={4}>
                            <div className="p-3 border border-dashed border-start-0">
                                <h5 className="mb-1">
                                    <CountUp
                                        start={0}
                                        end={stats.total_recordings ?? 0}
                                        duration={2}
                                        separator=","
                                        formattingFn={(value) =>
                                            gujaratiNumber(
                                                Math.round(value),
                                                locale,
                                            )
                                        }
                                    />
                                </h5>
                                <p className="text-muted mb-0">
                                    {t.recordings}
                                </p>
                            </div>
                        </Col>

                        <Col xs={12} sm={4}>
                            <div className="p-3 border border-dashed border-start-0 border-end-0">
                                <h5 className="mb-1 text-success">
                                    <CountUp
                                        start={0}
                                        end={stats.published_percent ?? 0}
                                        decimals={1}
                                        duration={2}
                                        formattingFn={(value) =>
                                            gujaratiNumber(
                                                value.toFixed(1),
                                                locale,
                                            ) + "%"
                                        }
                                    />
                                </h5>
                                <p className="text-muted mb-0">{t.published}</p>
                            </div>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body className="p-0 pb-2">
                    <div className="w-100">
                        <div dir="ltr">
                            <ActivityCharts
                                series={chartData}
                                categories={activity?.categories}
                                dataColors='["--vz-primary", "--vz-success"]'
                            />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </React.Fragment>
    );
};

export default ActivityOverview;
