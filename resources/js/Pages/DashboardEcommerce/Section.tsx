import React from "react";
import { Col, Row } from "react-bootstrap";
import Flatpickr from "react-flatpickr";
import { Link, usePage } from "@inertiajs/react";

const Section = ({ rightClickBtn }: any) => {
    const { props } = usePage<any>();
    const locale = props.locale ?? "en";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const user = props.auth?.user;
    const username =
        typeof user?.name === "object"
            ? (user?.name?.[locale] ?? user?.name?.en ?? "")
            : (user?.name ?? "");

    const translations: Record<string, Record<string, string>> = {
        en: {
            "Jai Swaminarayan": "Jai Swaminarayan",
            "Here's what’s happening with your Kirtan library today.":
                "Here's what’s happening with your Kirtan library today.",
            "Add Kirtan": "Add Kirtan",
        },

        gu: {
            "Jai Swaminarayan": "જય સ્વામિનારાયણ",
            "Here's what’s happening with your Kirtan library today.":
                "આજે તમારી કીર્તન લાઇબ્રેરીમાં શું થઈ રહ્યું છે તે અહીં છે.",
            "Add Kirtan": "કીર્તન ઉમેરો",
        },
    };

    const tr = (text: string) => {
        return translations[locale]?.[text] ?? text;
    };

    return (
        <React.Fragment>
            <Row className="mb-3 pb-1">
                <Col xs={12}>
                    <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                        <div className="flex-grow-1">
                            <h4 className="fs-16 mb-1">
                                {tr("Jai Swaminarayan")}! {username}
                            </h4>
                            <p className="text-muted mb-0">
                                {tr(
                                    "Here's what’s happening with your Kirtan library today.",
                                )}
                            </p>
                        </div>
                        <div className="mt-3 mt-lg-0">
                            <form action="#">
                                <Row className="g-3 mb-0 align-items-center">
                                    <div className="col-sm-auto">
                                        {/* <div className="input-group">
                                            <Flatpickr
                                                className="form-control border-0 dash-filter-picker shadow"
                                                options={{
                                                    mode: "range",
                                                    dateFormat: "d M, Y",
                                                    defaultDate: [
                                                        new Date(
                                                            new Date().getFullYear(),
                                                            new Date().getMonth(),
                                                            1,
                                                        ),
                                                        new Date(),
                                                    ],
                                                }}
                                            />
                                            <div className="input-group-text bg-primary border-primary text-white">
                                                <i className="ri-calendar-2-line"></i>
                                            </div>
                                        </div> */}
                                    </div>
                                    <div className="col-auto">
                                        <Link
                                            href={route("role.pads.create", {
                                                rolePrefix: rolePrefix,
                                            })}
                                            className="btn btn-soft-success"
                                        >
                                            <i className="ri-add-circle-line align-middle me-1"></i>{" "}
                                            {tr("Add Kirtan")}
                                        </Link>
                                    </div>
                                    <div className="col-auto">
                                        <button
                                            type="button"
                                            className="btn btn-soft-info btn-icon waves-effect waves-light layout-rightside-btn"
                                            onClick={rightClickBtn}
                                        >
                                            <i className="ri-pulse-line"></i>
                                        </button>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default Section;
