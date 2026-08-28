import React, { useState } from "react";
import { Button, Col, Dropdown, Nav, Row, Tab } from "react-bootstrap";
import { usePage, Link } from "@inertiajs/react";
import SimpleBar from "simplebar-react";

// images
import avatar2 from "../../../images/users/avatar-2.jpg";
import avatar8 from "../../../images/users/avatar-8.jpg";
import avatar3 from "../../../images/users/avatar-3.jpg";
import avatar6 from "../../../images/users/avatar-6.jpg";
import bell from "../../../images/svg/bell.svg";

const NotificationDropdown = () => {
    const { locale } = usePage().props as { locale: string };

    // ─── Translations ────────────────────────────────────────────────
    const t: Record<string, { en: string; gu: string }> = {
        Notifications: { en: "Notifications", gu: "સૂચનાઓ" },
        "4 New": { en: "4 New", gu: "4 નવી" },
        "All (4)": { en: "All (4)", gu: "બધી (4)" },
        Messages: { en: "Messages", gu: "સંદેશા" },
        Alerts: { en: "Alerts", gu: "ચેતવણીઓ" },
        "unread messages": { en: "unread messages", gu: "ન વાંચેલા સંદેશા" },

        // Notification content
        "New Pad Added": {
            en: "New Pad “Shri Krishna Kirtan” has been added",
            gu: "નવું પદ “શ્રી કૃષ્ણ કીર્તન” ઉમેરાયું છે",
        },
        "Just 30 sec ago": { en: "Just 30 sec ago", gu: "માત્ર 30 સેકન્ડ પહેલાં" },

        "Pad Published": {
            en: "Pad “Morning Prayer” has been published",
            gu: "પદ “સવારની પ્રાર્થના” પ્રકાશિત કરવામાં આવ્યું છે",
        },
        "48 min ago": { en: "48 min ago", gu: "48 મિનિટ પહેલાં" },

        "New Category Created": {
            en: "New category “Bhav” has been created",
            gu: "નવી કેટેગરી “ભાવ” બનાવવામાં આવી છે",
        },
        "2 hrs ago": { en: "2 hrs ago", gu: "2 કલાક પહેલાં" },

        "User Registered": {
            en: "New user “Maureen Gibson” has registered",
            gu: "નવા યુઝર “Maureen Gibson” નોંધણી કરી છે",
        },
        "4 hrs ago": { en: "4 hrs ago", gu: "4 કલાક પહેલાં" },

        "Pad Updated": {
            en: "Pad “Evening Aarti” was updated by admin",
            gu: "પદ “સાંજની આરતી” એડમિન દ્વારા અપડેટ કરવામાં આવ્યું",
        },
        "30 min ago": { en: "30 min ago", gu: "30 મિનિટ પહેલાં" },

        "Comment on Pad": {
            en: "Someone commented on Pad “Shri Swaminarayan Kirtan”",
            gu: "કોઈએ પદ “શ્રી સ્વામિનારાયણ કીર્તન” પર કોમેન્ટ કર્યું",
        },
        "10 hrs ago": { en: "10 hrs ago", gu: "10 કલાક પહેલાં" },

        "View All Notifications": {
            en: "View All Notifications",
            gu: "બધી સૂચનાઓ જુઓ",
        },
        "View All Messages": {
            en: "View All Messages",
            gu: "બધા સંદેશા જુઓ",
        },
        "Hey! You have no any notifications": {
            en: "Hey! You have no notifications right now",
            gu: "હે! અત્યારે તમારી પાસે કોઈ સૂચના નથી",
        },
    };

    const tr = (key: string) => t[key]?.[locale as "en" | "gu"] ?? t[key]?.en ?? key;

    const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);
    const toggleNotificationDropdown = () => {
        setIsNotificationDropdown(!isNotificationDropdown);
    };

    return (
        <React.Fragment>
            <Dropdown
                show={isNotificationDropdown}
                onClick={toggleNotificationDropdown}
                className="topbar-head-dropdown ms-1 header-item"
            >
                <Dropdown.Toggle
                    type="button"
                    as="button"
                    className="arrow-none btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                >
                    <i className="bx bx-bell fs-22"></i>
                    <span className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">
                        4
                        <span className="visually-hidden">{tr("unread messages")}</span>
                    </span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-menu-lg dropdown-menu-end p-0">
                    {/* Header */}
                    <div className="p-3 bg-primary bg-pattern rounded-top">
                        <Row className="align-items-center">
                            <Col>
                                <h6 className="m-0 fs-16 fw-semibold text-white">
                                    {tr("Notifications")}
                                </h6>
                            </Col>
                            <div className="col-auto dropdown-tabs">
                                <span className="badge bg-light-subtle fs-13 text-body">
                                    {tr("4 New")}
                                </span>
                            </div>
                        </Row>
                    </div>

                    <Tab.Container defaultActiveKey="all">
                        <div className="px-2 pt-2 bg-primary bg-pattern">
                            <Nav className="nav-tabs nav-tabs-custom" role="tablist">
                                <Nav.Item>
                                    <Nav.Link eventKey="all">{tr("All (4)")}</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="messages">{tr("Messages")}</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="alerts">{tr("Alerts")}</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>

                        <Tab.Content>
                            {/* ===================== ALL ===================== */}
                            <Tab.Pane eventKey="all" className="py-2 ps-2">
                                <SimpleBar style={{ maxHeight: "300px" }} className="pe-2">
                                    {/* New Pad */}
                                    <div className="text-reset notification-item d-block dropdown-item position-relative">
                                        <div className="d-flex">
                                            <div className="avatar-xs me-3 flex-shrink-0">
                                                <span className="avatar-title bg-success-subtle text-success rounded-circle fs-16">
                                                    <i className="bx bx-music"></i>
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <Link href="/admin/pads-list" className="stretched-link p-0">
                                                    <h6 className="mt-0 mb-2 lh-base">
                                                        {tr("New Pad Added")}
                                                    </h6>
                                                </Link>
                                                <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                    <span>
                                                        <i className="mdi mdi-clock-outline"></i>{" "}
                                                        {tr("Just 30 sec ago")}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pad Published */}
                                    <div className="text-reset notification-item d-block dropdown-item position-relative">
                                        <div className="d-flex">
                                            <div className="avatar-xs me-3 flex-shrink-0">
                                                <span className="avatar-title bg-info-subtle text-info rounded-circle fs-16">
                                                    <i className="bx bx-badge-check"></i>
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <Link href="/admin/pads-list" className="stretched-link p-0">
                                                    <h6 className="mt-0 mb-2 lh-base">
                                                        {tr("Pad Published")}
                                                    </h6>
                                                </Link>
                                                <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                    <span>
                                                        <i className="mdi mdi-clock-outline"></i>{" "}
                                                        {tr("48 min ago")}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Category */}
                                    <div className="text-reset notification-item d-block dropdown-item position-relative">
                                        <div className="d-flex">
                                            <div className="avatar-xs me-3 flex-shrink-0">
                                                <span className="avatar-title bg-warning-subtle text-warning rounded-circle fs-16">
                                                    <i className="bx bx-collection"></i>
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <Link href="/admin/categories/bhav-list" className="stretched-link p-0">
                                                    <h6 className="mt-0 mb-2 lh-base">
                                                        {tr("New Category Created")}
                                                    </h6>
                                                </Link>
                                                <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                    <span>
                                                        <i className="mdi mdi-clock-outline"></i>{" "}
                                                        {tr("2 hrs ago")}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New User */}
                                    <div className="text-reset notification-item d-block dropdown-item position-relative">
                                        <div className="d-flex">
                                            <img
                                                src={avatar8}
                                                className="me-3 rounded-circle avatar-xs"
                                                alt="user-pic"
                                            />
                                            <div className="flex-grow-1">
                                                <Link href="/admin/users-list" className="stretched-link p-0">
                                                    <h6 className="mt-0 mb-1 fs-13 fw-semibold">
                                                        {tr("User Registered")}
                                                    </h6>
                                                </Link>
                                                <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                    <span>
                                                        <i className="mdi mdi-clock-outline"></i>{" "}
                                                        {tr("4 hrs ago")}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="my-3 text-center">
                                        <Link
                                            href="/admin/notifications"
                                            className="btn btn-soft-success waves-effect waves-light"
                                        >
                                            {tr("View All Notifications")}{" "}
                                            <i className="ri-arrow-right-line align-middle"></i>
                                        </Link>
                                    </div>
                                </SimpleBar>
                            </Tab.Pane>

                            {/* ===================== MESSAGES ===================== */}
                            <Tab.Pane eventKey="messages" className="py-2 ps-2">
                                <SimpleBar style={{ maxHeight: "300px" }} className="pe-2">
                                    <div className="text-reset notification-item d-block dropdown-item">
                                        <div className="d-flex">
                                            <img
                                                src={avatar3}
                                                className="me-3 rounded-circle avatar-xs"
                                                alt="user-pic"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="mt-0 mb-1 fs-13 fw-semibold">James Lemire</h6>
                                                <div className="fs-13 text-muted">
                                                    <p className="mb-1">{tr("Pad Updated")}</p>
                                                </div>
                                                <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                    <span>
                                                        <i className="mdi mdi-clock-outline"></i>{" "}
                                                        {tr("30 min ago")}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-reset notification-item d-block dropdown-item">
                                        <div className="d-flex">
                                            <img
                                                src={avatar2}
                                                className="me-3 rounded-circle avatar-xs"
                                                alt="user-pic"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="mt-0 mb-1 fs-13 fw-semibold">Angela Bernier</h6>
                                                <div className="fs-13 text-muted">
                                                    <p className="mb-1">{tr("Comment on Pad")}</p>
                                                </div>
                                                <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                    <span>
                                                        <i className="mdi mdi-clock-outline"></i>{" "}
                                                        {tr("10 hrs ago")}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="my-3 text-center">
                                        <button
                                            type="button"
                                            className="btn btn-soft-success waves-effect waves-light"
                                        >
                                            {tr("View All Messages")}{" "}
                                            <i className="ri-arrow-right-line align-middle"></i>
                                        </button>
                                    </div>
                                </SimpleBar>
                            </Tab.Pane>

                            {/* ===================== ALERTS ===================== */}
                            <Tab.Pane eventKey="alerts" className="p-4">
                                <div className="w-25 w-sm-50 pt-3 mx-auto">
                                    <img src={bell} className="img-fluid" alt="user-pic" />
                                </div>
                                <div className="text-center pb-5 mt-2">
                                    <h6 className="fs-18 fw-semibold lh-base">
                                        {tr("Hey! You have no any notifications")}
                                    </h6>
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Dropdown.Menu>
            </Dropdown>
        </React.Fragment>
    );
};

export default NotificationDropdown;