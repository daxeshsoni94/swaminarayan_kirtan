import React from "react";
import { Button, Card, Col, Dropdown } from "react-bootstrap";
import { Link, usePage } from "@inertiajs/react";
import { gujaratiNumber } from "../../utils/number";

interface Translation {
    en?: string;
    gu?: string;
}

interface PopularPad {
    id: number;
    title: string;
    date: string;
    recordings: number;
    status: string;
    categories: string;
    pads: number;
}

interface Props {
    item: PopularPad[];
    total: number;
}

const PopularKirtans = ({ item, total }: Props) => {
    const { props } = usePage<any>();
    const locale = props.locale ?? "en";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    // Get translated value from JSON
    const getTranslation = (
        value: Translation | string | null | undefined,
    ): string => {
        if (!value) return "";

        if (typeof value === "string") {
            return value;
        }
        return value[locale as keyof Translation] ?? value.en ?? "";
    };
    const translations: Record<string, Record<string, string>> = {
        "Popular Kirtans": {
            en: "Popular Kirtans",
            gu: "લોકપ્રિય કીર્તનો",
        },
        "Sort by:": {
            en: "Sort by:",
            gu: "ક્રમ પ્રમાણે:",
        },
        Today: {
            en: "Today",
            gu: "આજે",
        },
        "This Week": {
            en: "This Week",
            gu: "આ અઠવાડિયે",
        },
        "This Month": {
            en: "This Month",
            gu: "આ મહિને",
        },
        "All time": {
            en: "All time",
            gu: "આખો સમય",
        },
        Recordings: {
            en: "Recordings",
            gu: "રેકોર્ડિંગ્સ",
        },
        Category: {
            en: "Category",
            gu: "કેટેગરી",
        },
        Published: {
            en: "Published",
            gu: "પ્રકાશિત",
        },
        Draft: {
            en: "Draft",
            gu: "ડ્રાફ્ટ",
        },
        Showing: {
            en: "Showing",
            gu: "દર્શાવેલ",
        },
        Kirtans: {
            en: "Kirtans",
            gu: "કીર્તનો",
        },
        of: {
            en: "of",
            gu: "માંથી",
        },
        "View all": {
            en: "View all",
            gu: "બધા જુઓ",
        },
    };
    const tr = (text: string): string => {
        return translations[text]?.[locale] ?? translations[text]?.en ?? text;
    };
    return (
        <React.Fragment>
            <Col xl={12}>
                <Card>
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">
                            {tr("Popular Kirtans")}
                        </h4>
                        <div className="flex-shrink-0">
                            <Dropdown className="card-header-dropdown">
                                <Dropdown.Toggle
                                    as="a"
                                    className="text-reset arrow-none"
                                    role="button"
                                >
                                    <span className="fw-semibold text-uppercase fs-12">
                                        {tr("Sort by:")}{" "}
                                    </span>
                                    <span className="text-muted">
                                        {tr("All time")}
                                        <i className="mdi mdi-chevron-down ms-1"></i>
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-end">
                                    <Dropdown.Item>{tr("Today")}</Dropdown.Item>
                                    <Dropdown.Item>
                                        {tr("This Week")}
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        {tr("This Month")}
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        {tr("All time")}
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <div className="table-responsive table-card">
                            <table className="table table-hover table-centered align-middle table-nowrap mb-0">
                                <tbody>
                                    {item.map((pad) => (
                                        <tr key={pad.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm bg-light rounded p-1 me-2 d-flex align-items-center justify-content-center">
                                                        <i className="ri-music-2-fill text-primary fs-18"></i>
                                                    </div>
                                                    <div>
                                                        <h5 className="fs-13 my-1">
                                                            <Link
                                                                href={route(
                                                                    "role.pads.edit",
                                                                    {
                                                                        rolePrefix:
                                                                            rolePrefix,
                                                                        pad: pad.id,
                                                                    },
                                                                )}
                                                                className="text-reset"
                                                            >
                                                                {getTranslation(
                                                                    pad.title,
                                                                )}
                                                            </Link>
                                                        </h5>
                                                        <span className="text-muted">
                                                            {gujaratiNumber(
                                                                pad.date,
                                                                locale,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <h5 className="fs-13 my-1 fw-normal">
                                                    {gujaratiNumber(
                                                        pad.recordings ?? 0,
                                                        locale,
                                                    )}
                                                </h5>
                                                <span className="text-muted">
                                                    {tr("Recordings")}
                                                </span>
                                            </td>
                                            <td>
                                                <h5 className="fs-13 my-1 fw-normal">
                                                    {pad.categories}
                                                </h5>
                                                <span className="text-muted">
                                                    {tr("Category")}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        pad.status ===
                                                        "Published"
                                                            ? "badge bg-success-subtle text-success"
                                                            : "badge bg-warning-subtle text-warning"
                                                    }
                                                >
                                                    {tr(pad.status)}
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
                                    {tr("Showing")}{" "}
                                    <span className="fw-semibold">5</span>{" "}
                                    {tr("of")}{" "}
                                    <span className="fw-semibold">
                                        {item.length}
                                    </span>{" "}
                                    {tr("Kirtans")}
                                </div>
                            </div>
                            <div className="col-sm-auto mt-3 mt-sm-0">
                                <Link
                                    href={route("role.pads.list", {
                                        rolePrefix: rolePrefix,
                                    })}
                                    className="btn btn-soft-primary btn-sm"
                                >
                                    {tr("View all")}
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
