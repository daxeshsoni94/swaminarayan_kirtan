import React from "react";
import { Card, Col } from "react-bootstrap";
import { Link, usePage } from "@inertiajs/react";
import { gujaratiNumber } from "../../utils/number";

interface RecentPad {
    id: number;
    title: string;
    status: string;
    statusClass: string;
    by: string;
    date: string | number;
}

interface Props {
    items: RecentPad[];
}

interface PageProps {
    locale: string;
}
const translations: Record<string, Record<string, string>> = {
    en: {
        "Recent Kirtans": "Recent Kirtans",
        "View All": "View All",
        ID: "ID",
        Kirtan: "Kirtan",
        "Updated by": "Updated by",
        Date: "Date",
        Status: "Status",
        Draft: "Draft",
        Published: "Published",
    },

    gu: {
        "Recent Kirtans": "તાજેતરના કીર્તનો",
        "View All": "બધા જુઓ",
        ID: "આઈડી",
        Kirtan: "કીર્તન",
        "Updated by": "અપડેટ કરનાર",
        Date: "તારીખ",
        Status: "સ્થિતિ",
        Draft: "ડ્રાફ્ટ",
        Published: "પ્રકાશિત",
    },
};
const RecentKirtans = ({ items }: Props) => {
    const { locale } = usePage<PageProps>().props;
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const tr = (key: string): string => {
        return translations[locale]?.[key] ?? translations.en[key] ?? key;
    };
    return (
        <React.Fragment>
            <Col xl={8}>
                <Card>
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">
                            {tr("Recent Kirtans")}
                        </h4>
                        <div className="flex-shrink-0">
                            <Link
                                href={route("role.pads.list", {
                                    rolePrefix: rolePrefix,
                                })}
                                className="btn btn-soft-info btn-sm"
                            >
                                <i className="ri-file-list-3-line align-middle"></i>{" "}
                                {tr("View All")}
                            </Link>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <div className="table-responsive table-card">
                            <table className="table table-borderless table-centered align-middle table-nowrap mb-0">
                                <thead className="text-muted table-light">
                                    <tr>
                                        <th scope="col">{tr("ID")}</th>
                                        <th scope="col">{tr("Kirtan")}</th>
                                        <th scope="col">{tr("Updated by")}</th>
                                        <th scope="col">{tr("Date")}</th>
                                        <th scope="col">{tr("Status")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <Link
                                                    href={route(
                                                        "role.pads.edit",
                                                        {
                                                            rolePrefix:
                                                                rolePrefix,
                                                            pad: item.id,
                                                        },
                                                    )}
                                                    className="fw-medium link-primary"
                                                >
                                                    #
                                                    {gujaratiNumber(
                                                        item.id,
                                                        locale,
                                                    )}
                                                </Link>
                                            </td>
                                            <td>{item.title}</td>
                                            <td>{tr(item.by)}</td>
                                            <td>
                                                {gujaratiNumber(
                                                    item.date,
                                                    locale,
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        "badge bg-" +
                                                        item.statusClass +
                                                        "-subtle text-" +
                                                        item.statusClass
                                                    }
                                                >
                                                    {tr(item.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default RecentKirtans;
