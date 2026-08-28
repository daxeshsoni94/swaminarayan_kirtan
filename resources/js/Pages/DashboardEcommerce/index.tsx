import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { Col, Container, Row } from "react-bootstrap";

import Layout from "../../Layouts";
import Widgets from "./Widgets";
import Section from "./Section";
import ActivityOverview from "./ActivityOverview";
import PadsByStatus from "./PadsByStatus";
import PopularKirtans from "./PopularKirtan";
import TopCategories from "./TopCategories";
import CategoryBreakdown from "./CategoryBreakdown";
import RecentKirtans from "./RecentKirtans";
import RecentActivity from "./RecentActivity";

export default function Dashboard({
    stats,
    activity,
    padsByStatus,
    popularPads,
    popularPadsTotal,
    categoryBreakdown,
    recentPads,
}) {
    const [rightColumn, setRightColumn] = useState<boolean>(true);
    const toggleRightColumn = () => setRightColumn(!rightColumn);

    return (
        <React.Fragment>
            <Head title="Dashboard | Swaminarayan Kirtan" />
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
                        {/* <RecentActivity
                            rightColumn={rightColumn}
                            hideRightColumn={toggleRightColumn}
                        /> */}
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

Dashboard.layout = (page: any) => <Layout children={page} />;
