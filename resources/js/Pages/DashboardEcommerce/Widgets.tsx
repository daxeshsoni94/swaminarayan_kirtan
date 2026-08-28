import React, { useMemo } from "react";
import CountUp from "react-countup";
import { Card, Col } from "react-bootstrap";
import { Link, usePage } from "@inertiajs/react";
import { gujaratiNumber } from "../../utils/number";

type Stats = {
    total_pads?: number;
    total_favorites?: number;
    total_drafts?: number;
    pads_change?: number;
    favorites_change?: number;
    drafts_change?: number;
};

const Widgets = ({ stats = {} as Stats }: { stats?: Stats }) => {
    const { locale } = usePage().props as {
        locale: string;
    };

    const isGu = locale === "gu";
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const widgets = useMemo(() => {
        const padsChange = stats.pads_change ?? 0;
        const favoritesChange = stats.favorites_change ?? 0;
        const draftsChange = stats.drafts_change ?? 0;

        return [
            {
                id: 1,
                label: isGu ? "કુલ પદો" : "Total Pads",
                counter: stats.total_pads ?? 0,
                badge:
                    padsChange >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line",
                badgeClass: padsChange >= 0 ? "success" : "danger",
                percentage: Math.abs(padsChange).toString(),
                link: isGu ? "બધા પદો જુઓ" : "View all pads",
                href: "role.pads.list",
                routeParams: {
                    rolePrefix: rolePrefix,
                },
                bgcolor: "primary",
                icon: "ri-music-2-line",
                decimals: 0,
                prefix: "",
                suffix: "",
                separator: ",",
            },
            {
                id: 2,
                label: isGu ? "મનપસંદ પદો" : "Favorite Pads",
                counter: stats.total_favorites ?? 0,
                badge:
                    favoritesChange >= 0
                        ? "ri-arrow-up-line"
                        : "ri-arrow-down-line",
                badgeClass: favoritesChange >= 0 ? "success" : "danger",
                percentage: Math.abs(favoritesChange).toString(),
                link: isGu ? "મનપસંદ જુઓ" : "View favorites",
                href: "role.pads.favorites",
                routeParams: {
                    rolePrefix: rolePrefix,
                },
                bgcolor: "danger",
                icon: "ri-heart-line",
                decimals: 0,
                prefix: "",
                suffix: "",
                separator: ",",
            },
            {
                id: 3,
                label: isGu ? "ડ્રાફ્ટ્સ" : "Drafts",
                counter: stats.total_drafts ?? 0,
                badge:
                    draftsChange >= 0
                        ? "ri-arrow-up-line"
                        : "ri-arrow-down-line",
                badgeClass: draftsChange >= 0 ? "success" : "danger",
                percentage: Math.abs(draftsChange).toString(),
                link: isGu ? "ડ્રાફ્ટ્સની સમીક્ષા કરો" : "Review drafts",
                href: "role.pads.list",
                routeParams: {
                    rolePrefix: rolePrefix,
                    status: "draft",
                },
                bgcolor: "warning",
                icon: "ri-draft-line",
                decimals: 0,
                prefix: "",
                suffix: "",
                separator: ",",
            },
        ];
    }, [stats, isGu, rolePrefix]);

    return (
        <React.Fragment>
            {widgets.map((item, key) => (
                <Col xl={4} md={6} key={key}>
                    <Card className="card-animate">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1 overflow-hidden">
                                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                                        {item.label}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <h5
                                        className={
                                            "fs-14 mb-0 text-" + item.badgeClass
                                        }
                                    >
                                        {item.badge ? (
                                            <i
                                                className={
                                                    "fs-13 align-middle " +
                                                    item.badge
                                                }
                                            ></i>
                                        ) : null}{" "}
                                        {item.percentage} %
                                    </h5>
                                </div>
                            </div>
                            <div className="d-flex align-items-end justify-content-between mt-4">
                                <div>
                                    <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                                        <span className="counter-value">
                                            {isGu ? (
                                                gujaratiNumber(
                                                    item.counter.toLocaleString(
                                                        "en-IN",
                                                    ),
                                                    locale,
                                                )
                                            ) : (
                                                <CountUp
                                                    start={0}
                                                    prefix={item.prefix}
                                                    suffix={item.suffix}
                                                    separator={item.separator}
                                                    end={item.counter}
                                                    decimals={item.decimals}
                                                    duration={2}
                                                />
                                            )}
                                        </span>
                                    </h4>
                                    {item.href && item.href !== "#" ? (
                                        <Link
                                            href={
                                                item.href ===
                                                    "role.pads.list" &&
                                                item.label ===
                                                    (isGu
                                                        ? "ડ્રાફ્ટ્સ"
                                                        : "Drafts")
                                                    ? route("role.pads.list", {
                                                          rolePrefix:
                                                              rolePrefix,
                                                          status: "draft",
                                                      })
                                                    : route(item.href, {
                                                          rolePrefix:
                                                              rolePrefix,
                                                      })
                                            }
                                            className="text-decoration-underline"
                                        >
                                            {item.link}
                                        </Link>
                                    ) : (
                                        <span className="text-decoration-underline text-muted">
                                            {item.link}
                                        </span>
                                    )}
                                </div>
                                <div className="avatar-sm flex-shrink-0">
                                    <span
                                        className={
                                            "avatar-title rounded fs-3 bg-" +
                                            item.bgcolor +
                                            "-subtle"
                                        }
                                    >
                                        <i
                                            className={`text-${item.bgcolor} ${item.icon}`}
                                        ></i>
                                    </span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </React.Fragment>
    );
};

export default Widgets;