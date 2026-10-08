import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";
import { usePage } from "@inertiajs/react";
import { gujaratiNumber } from "../../utils/number";

interface PageProps {
    locale: string;
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

interface ActivityChartsProps {
    dataColors: string;
    series?: any[];
    categories?: string[];
}

const ActivityCharts = ({
    dataColors,
    series = [],
    categories = [],
}: ActivityChartsProps) => {
    const { locale, translations = {} } = usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const colors = getChartColorsArray(dataColors);

    const tr = useMemo(() => createTranslator(translations), [translations]);

    /*
     * Month translation comes from the centralized
     * language JSON file.
     *
     * Example:
     * Jan -> tr("jan")
     * Feb -> tr("feb")
     */
    const monthMap: Record<string, string> = {
        Jan: tr("jan"),
        Feb: tr("feb"),
        Mar: tr("mar"),
        Apr: tr("apr"),
        May: tr("may"),
        Jun: tr("jun"),
        Jul: tr("jul"),
        Aug: tr("aug"),
        Sep: tr("sep"),
        Oct: tr("oct"),
        Nov: tr("nov"),
        Dec: tr("dec"),
    };

    const defaultMonths = [
        tr("jan"),
        tr("feb"),
        tr("mar"),
        tr("apr"),
        tr("may"),
        tr("jun"),
        tr("jul"),
        tr("aug"),
        tr("sep"),
        tr("oct"),
        tr("nov"),
        tr("dec"),
    ];

    const xCategories =
        categories.length > 0
            ? categories.map((category) => monthMap[category] ?? category)
            : defaultMonths;

    /*
     * Translate series names using centralized translations.
     *
     * The backend/chart data should continue using stable
     * English keys such as "Pads" and "Kirtans".
     */
    const translatedSeries = series.map((item: any) => {
        let translatedName = item.name;

        if (item.name === "Pads") {
            translatedName = tr("pads");
        } else if (item.name === "Kirtans") {
            translatedName = tr("kirtans");
        } else if (item.name === "Recordings") {
            translatedName = tr("recordings");
        }

        return {
            ...item,
            name: translatedName,
        };
    });

    const options: any = {
        chart: {
            height: 370,
            type: "line",
            toolbar: {
                show: false,
            },
        },

        stroke: {
            curve: "straight",
            dashArray: [0, 0, 8],
            width: [2, 0, 2.2],
        },

        fill: {
            opacity: [0.1, 0.9, 1],
        },

        markers: {
            size: [0, 0, 0],
            strokeWidth: 2,
            hover: {
                size: 4,
            },
        },

        xaxis: {
            categories: xCategories,
            axisTicks: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
        },

        yaxis: {
            labels: {
                formatter: (value: number) => {
                    return gujaratiNumber(value, currentLocale);
                },
            },
        },

        grid: {
            show: true,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: false,
                },
            },
            padding: {
                top: 0,
                right: -2,
                bottom: 15,
                left: 10,
            },
        },

        legend: {
            show: true,
            horizontalAlign: "center",
            offsetX: 0,
            offsetY: -5,

            markers: {
                width: 9,
                height: 9,
                radius: 6,
            },

            itemMargin: {
                horizontal: 10,
                vertical: 0,
            },
        },

        plotOptions: {
            bar: {
                columnWidth: "30%",
                barHeight: "70%",
            },
        },

        colors,

        tooltip: {
            shared: true,

            y: [
                {
                    formatter: (y: any) =>
                        typeof y !== "undefined"
                            ? `${gujaratiNumber(
                                  y,
                                  currentLocale,
                              )} ${tr("pads")}`
                            : y,
                },
            ],
        },
    };

    return (
        <React.Fragment>
            <ReactApexChart
                dir="ltr"
                options={options}
                series={translatedSeries}
                type="line"
                height="370"
                className="apex-charts"
            />
        </React.Fragment>
    );
};

interface CategoryVisitsChartsProps {
    dataColors: string;
    labels?: string[];
    series?: number[];
}

const CategoryVisitsCharts = ({
    dataColors,
    labels = [],
    series = [],
}: CategoryVisitsChartsProps) => {
    const { locale, translations = {} } = usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const colors = getChartColorsArray(dataColors);

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const translatedLabels = labels.length > 0 ? labels : [tr("no_data")];

    const options: any = {
        labels: translatedLabels,

        chart: {
            height: 333,
            type: "donut",
        },

        legend: {
            position: "bottom",
        },

        stroke: {
            show: false,
        },

        dataLabels: {
            enabled: true,

            formatter: (value: number) => {
                return `${gujaratiNumber(value.toFixed(1), currentLocale)}%`;
            },

            dropShadow: {
                enabled: false,
            },
        },

        colors,
    };

    return (
        <React.Fragment>
            <ReactApexChart
                dir="ltr"
                options={options}
                series={series.length > 0 ? series : [1]}
                type="donut"
                height="333"
                className="apex-charts"
            />
        </React.Fragment>
    );
};

export { ActivityCharts, CategoryVisitsCharts };
