import React from "react";
import { Button, Card, Col, Dropdown } from "react-bootstrap";
import { Link } from "@inertiajs/react";

const popularKirtans = [
    {
        title: "Vandu Sahajanand",
        date: "Est. 1826",
        pads: 8,
        recordings: 12,
        status: "Published",
        categories: "Prabhatiya",
    },
    {
        title: "Dhanya Dhanya Aaj",
        date: "Est. 1850",
        pads: 6,
        recordings: 9,
        status: "Published",
        categories: "Utsav",
    },
    {
        title: "Mara Swami Sukhdham",
        date: "Est. 1902",
        pads: 5,
        recordings: 7,
        status: "Published",
        categories: "Raag",
    },
    {
        title: "Aajni Ghadi Re",
        date: "Est. 1920",
        pads: 4,
        recordings: 3,
        status: "Draft",
        categories: "Season",
    },
    {
        title: "Jay Jay Swaminarayan",
        date: "Est. 1885",
        pads: 10,
        recordings: 15,
        status: "Published",
        categories: "Aarti",
    },
];

const PopularKirtans = () => {
    return (
        <React.Fragment>
            <Col xl={6}>
                <Card>
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Popular Kirtans</h4>
                        <div className="flex-shrink-0">
                            <Dropdown className="card-header-dropdown">
                                <Dropdown.Toggle
                                    as="a"
                                    className="text-reset arrow-none"
                                    role="button"
                                >
                                    <span className="fw-semibold text-uppercase fs-12">
                                        Sort by:{" "}
                                    </span>
                                    <span className="text-muted">
                                        All time
                                        <i className="mdi mdi-chevron-down ms-1"></i>
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-end">
                                    <Dropdown.Item>Today</Dropdown.Item>
                                    <Dropdown.Item>This Week</Dropdown.Item>
                                    <Dropdown.Item>This Month</Dropdown.Item>
                                    <Dropdown.Item>All time</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <div className="table-responsive table-card">
                            <table className="table table-hover table-centered align-middle table-nowrap mb-0">
                                <tbody>
                                    {popularKirtans.map((item, key) => (
                                        <tr key={key}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm bg-light rounded p-1 me-2 d-flex align-items-center justify-content-center">
                                                        <i className="ri-music-2-fill text-primary fs-18"></i>
                                                    </div>
                                                    <div>
                                                        <h5 className="fs-14 my-1">
                                                            <Link
                                                                href="#"
                                                                className="text-reset"
                                                            >
                                                                {item.title}
                                                            </Link>
                                                        </h5>
                                                        <span className="text-muted">
                                                            {item.date}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <h5 className="fs-14 my-1 fw-normal">
                                                    {item.pads}
                                                </h5>
                                                <span className="text-muted">Pads</span>
                                            </td>
                                            <td>
                                                <h5 className="fs-14 my-1 fw-normal">
                                                    {item.recordings}
                                                </h5>
                                                <span className="text-muted">Recordings</span>
                                            </td>
                                            <td>
                                                <h5 className="fs-14 my-1 fw-normal">
                                                    {item.categories}
                                                </h5>
                                                <span className="text-muted">Category</span>
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        item.status === "Published"
                                                            ? "badge bg-success-subtle text-success"
                                                            : "badge bg-warning-subtle text-warning"
                                                    }
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="align-items-center mt-4 pt-2 justify-content-between row text-center text-sm-start">
                            <div className="col-sm">
                                <div className="text-muted">
                                    Showing <span className="fw-semibold">5</span> of{" "}
                                    <span className="fw-semibold">248</span> Kirtans
                                </div>
                            </div>
                            <div className="col-sm-auto mt-3 mt-sm-0">
                                <Link
                                    href={route("admin.kirtans.list")}
                                    className="btn btn-soft-primary btn-sm"
                                >
                                    View all
                                </Link>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default PopularKirtans;