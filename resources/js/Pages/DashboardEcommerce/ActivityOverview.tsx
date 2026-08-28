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
    const { locale } = usePage().props as {
        locale: string;
    };

    const isGu = locale === "gu";
    const chartData = useMemo(() => {
        if (activity?.series?.length) {
            return activity.series;
        }

        // Empty fallback (12 months)
        return [
            { name: "Pads", type: "bar", data: Array(12).fill(0) },
            { name: "Recordings", type: "line", data: Array(12).fill(0) },
        ];
    }, [activity]);

    console.log("activity prop →", activity);
    console.log("chartData →", chartData);
    console.log("categories →", activity?.categories);

    return (
        <React.Fragment>
            <Card>
                <Card.Header className="border-0 align-items-center d-flex">
                    <h4 className="card-title mb-0 flex-grow-1">
                        {isGu ? "પુસ્તકાલય પ્રવૃત્તિ" : "Library Activity"}
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
                                <p className="text-muted mb-0">
                                    {" "}
                                    {isGu ? "પદો" : "Pads"}
                                </p>
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
                                    {" "}
                                    {isGu ? "રેકોર્ડિંગ્સ" : "Recordings"}
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
                                            ) + (locale === "gu" ? "%" : "%")
                                        }
                                    />
                                </h5>
                                <p className="text-muted mb-0">
                                    {isGu ? "પ્રકાશિત" : "Published"}
                                </p>
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
