import React from "react";
import { Card, Col, Dropdown } from "react-bootstrap";
import { CategoryVisitsCharts } from "./DashboardKirtanCharts";
import { usePage } from "@inertiajs/react";

interface CategoryBreakdownProps {
    data?: {
        labels: string[];
        series: number[];
    };
}
interface PageProps {
    locale: string;
}
const CategoryBreakdown = ({ data }: CategoryBreakdownProps) => {
    const { locale } = usePage<PageProps>().props;
    const getTranslatedLabel = (value: string) => {
        try {
            // If value is JSON translation data
            const translations = JSON.parse(value);

            if (typeof translations === "object" && translations !== null) {
                return (
                    translations[locale] ??
                    translations["en"] ??
                    Object.values(translations)[0] ??
                    value
                );
            }

            return value;
        } catch {
            // If value is already a normal string
            return value;
        }
    };

    const translatedLabels =
        data?.labels?.map((label) => getTranslatedLabel(label)) ?? [];
    
        
    return (
        <React.Fragment>
            <Col xl={4}>
                <Card className="card-height-100">
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">
                            {locale === "gu"
                                ? "કેટેગરી પ્રકાર પ્રમાણે સામગ્રી"
                                : "Content by Category Type"}
                        </h4>
                        <div className="flex-shrink-0">
                            <Dropdown className="card-header-dropdown">
                                <Dropdown.Toggle
                                    as="a"
                                    className="text-reset dropdown-btn arrow-none"
                                    role="button"
                                >
                                    <span className="text-muted">
                                        {locale === "gu" ? "રિપોર્ટ" : "Report"}
                                        <i className="mdi mdi-chevron-down ms-1"></i>
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-end">
                                    <Dropdown.Item>
                                        {locale === "gu"
                                            ? "રિપોર્ટ ડાઉનલોડ કરો"
                                            : "Download Report"}
                                    </Dropdown.Item>
                                    <Dropdown.Item>{locale === "gu"
                                            ? "એક્સપોર્ટ કરો"
                                            : "Export"}</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <CategoryVisitsCharts
                            dataColors='["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]'
                            labels={translatedLabels}
                            series={data?.series}
                        />
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default CategoryBreakdown;
