import React from "react";
import { Button, Card } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { Link, usePage } from "@inertiajs/react";

interface RecentActivityProps {
    rightColumn: boolean;
    hideRightColumn: () => void;
}

const activities = [
    {
        icon: "ri-music-2-line",
        color: "success",
        title: "New kirtan added",
        desc: "Vandu Sahajanand",
        time: "02:14 PM Today",
    },
    {
        icon: "ri-file-music-line",
        color: "primary",
        title: "Pad updated",
        desc: "Pad 3 lyrics revised",
        time: "11:30 AM Today",
    },
    {
        icon: "ri-mic-line",
        color: "info",
        title: "Recording uploaded",
        desc: "Studio version – Vandu Sahajanand",
        time: "Yesterday",
    },
    {
        icon: "ri-price-tag-3-line",
        color: "warning",
        title: "Category assigned",
        desc: "Raag → Prabhatiya",
        time: "25 Jul, 2026",
    },
    {
        icon: "ri-draft-line",
        color: "danger",
        title: "Moved to draft",
        desc: "Aajni Ghadi Re",
        time: "24 Jul, 2026",
    },
    {
        icon: "ri-check-double-line",
        color: "success",
        title: "Kirtan published",
        desc: "Jay Jay Swaminarayan",
        time: "22 Jul, 2026",
    },
];

const topCategoryList = [
    { category: "Prabhatiya", total: 124 },
    { category: "Garbi", total: 98 },
    { category: "Janmotsav", total: 86 },
    { category: "Diwali", total: 64 },
    { category: "Vasant", total: 52 },
    { category: "Aarti", total: 48 },
    { category: "Thaal", total: 41 },
    { category: "Dhol", total: 36 },
];

const RecentActivity = ({
    rightColumn,
    hideRightColumn,
}: RecentActivityProps) => {
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    return (
        <React.Fragment>
            <div
                className={
                    rightColumn
                        ? "col-auto layout-rightside-col d-block"
                        : "col-auto layout-rightside-col d-none"
                }
                id="layout-rightside-coll"
            >
                <div className="overlay" onClick={hideRightColumn}></div>
                <div className="layout-rightside">
                    <Card className="h-100 rounded-0">
                        <Card.Body className="p-0">
                            <div className="p-3">
                                <h6 className="text-muted mb-0 text-uppercase">
                                    Recent Activity
                                </h6>
                            </div>
                            <SimpleBar
                                style={{ maxHeight: "410px" }}
                                className="p-3 pt-0"
                            >
                                <div className="acitivity-timeline acitivity-main">
                                    {activities.map((item, key) => (
                                        <div
                                            key={key}
                                            className={`acitivity-item d-flex ${key > 0 ? "py-3" : ""}`}
                                        >
                                            <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                                                <div
                                                    className={`avatar-title bg-${item.color}-subtle text-${item.color} rounded-circle`}
                                                >
                                                    <i
                                                        className={item.icon}
                                                    ></i>
                                                </div>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h6 className="mb-1 lh-base">
                                                    {item.title}
                                                </h6>
                                                <p className="text-muted mb-1">
                                                    {item.desc}
                                                </p>
                                                <small className="mb-0 text-muted">
                                                    {item.time}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SimpleBar>

                            <div className="p-3 mt-2">
                                <h6 className="text-muted mb-3 text-uppercase fw-semibold">
                                    Top Categories
                                </h6>
                                <ol className="ps-3 text-muted">
                                    {topCategoryList.map((item, key) => (
                                        <li className="py-1" key={key}>
                                            <Link
                                                href="#"
                                                className="text-muted"
                                            >
                                                {item.category}{" "}
                                                <span className="float-end">
                                                    ({item.total})
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ol>
                                <div className="mt-3 text-center">
                                    <Button
                                        variant="link"
                                        href="#"
                                        className="p-0 text-muted text-decoration-underline"
                                    >
                                        View all Categories
                                    </Button>
                                </div>
                            </div>

                            <Card className="sidebar-alert bg-light border-0 text-center mx-4 mb-3 mt-3">
                                <Card.Body>
                                    <div className="avatar-md mx-auto mb-3">
                                        <div className="avatar-title bg-primary-subtle text-primary display-5 rounded-circle">
                                            <i className="ri-music-2-line"></i>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <h5>Add New Kirtan</h5>
                                        <p className="text-muted lh-base">
                                            Expand the library with a new
                                            Swaminarayan kirtan and pads.
                                        </p>
                                        <Link
                                            href={route("role.pads.create", {
                                                rolePrefix: rolePrefix,
                                            })}
                                            className="btn btn-primary btn-label rounded-pill"
                                        >
                                            <i className="ri-add-fill label-icon align-middle rounded-pill fs-16 me-2"></i>{" "}
                                            Create Kirtan
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </React.Fragment>
    );
};

export default RecentActivity;
