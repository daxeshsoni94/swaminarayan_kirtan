import React, { useMemo, useState } from "react";

import { Head, usePage } from "@inertiajs/react";

import { Col, Container, Row } from "react-bootstrap";

import Layout from "../../Layouts";

import Widgets from "./Widgets";
import Section from "./Section";
import ActivityOverview from "./ActivityOverview";
import PadsByStatus from "./PadsByStatus";
import PopularKirtans from "./PopularKirtan";
import CategoryBreakdown from "./CategoryBreakdown";
import RecentKirtans from "./RecentKirtans";

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

interface DashboardProps {
    stats?: any;
    activity?: any;
    padsByStatus?: any;
    popularPads?: any;
    popularPadsTotal?: any;
    categoryBreakdown?: any;
    recentPads?: any;
}

export default function Dashboard({
    stats,
    activity,
    padsByStatus,
    popularPads,
    popularPadsTotal,
    categoryBreakdown,
    recentPads,
}: DashboardProps) {
    const { locale, translations = {} } = usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const [rightColumn, setRightColumn] = useState<boolean>(true);

    const toggleRightColumn = () => {
        setRightColumn(!rightColumn);
    };

    return (
        <React.Fragment>
            <Head title={tr("dashboard")} />

            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col>
                            <div className="h-100">
                                <Section rightClickBtn={toggleRightColumn} />

                                <Row>
                                    <Widgets stats={stats} />
                                </Row>

                                <Row>
                                    <Col xl={8}>
                                        <ActivityOverview
                                            stats={stats}
                                            activity={activity}
                                        />
                                    </Col>

                                    <PadsByStatus data={padsByStatus} />
                                </Row>

                                <Row>
                                    <PopularKirtans
                                        item={popularPads}
                                        total={popularPadsTotal}
                                    />
                                </Row>

                                <Row>
                                    <RecentKirtans items={recentPads} />

                                    <CategoryBreakdown
                                        data={categoryBreakdown}
                                    />
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

Dashboard.layout = (page: any) => <Layout children={page} />;
