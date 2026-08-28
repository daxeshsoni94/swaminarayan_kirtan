import React from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";
import { usePage } from "@inertiajs/react";
import { gujaratiNumber } from "../../utils/number";

interface PageProps {
    locale: string;
}
const ActivityCharts = ({
    dataColors,
    series = [],
    categories = [],
}: {
    dataColors: string;
    series?: any[];
    categories?: string[];
}) => {
    const { locale } = usePage<PageProps>().props;
    const colors = getChartColorsArray(dataColors);

    // const xCategories =
    //     categories?.length > 0
    //         ? categories
    //         : [
    //               "Jan",
    //               "Feb",
    //               "Mar",
    //               "Apr",
    //               "May",
    //               "Jun",
    //               "Jul",
    //               "Aug",
    //               "Sep",
    //               "Oct",
    //               "Nov",
    //               "Dec",
    //           ];

    const translations = {
        en: {
            months: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
            kirtans: "Kirtans",
            pads: "Pads",
            recordings: "Recordings",
        },
        gu: {
            months: [
                "જાન્યુઆરી",
                "ફેબ્રુઆરી",
                "માર્ચ",
                "એપ્રિલ",
                "મે",
                "જૂન",
                "જુલાઈ",
                "ઑગસ્ટ",
                "સપ્ટેમ્બર",
                "ઑક્ટોબર",
                "નવેમ્બર",
                "ડિસેમ્બર",
            ],
            kirtans: "કીર્તન",
            pads: "પદ",
            recordings: "રેકોર્ડિંગ",
        },
    };
    const t = translations[locale as "en" | "gu"] ?? translations.en;

    const monthMap: Record<string, string> = {
        Jan: t.months[0],
        Feb: t.months[1],
        Mar: t.months[2],
        Apr: t.months[3],
        May: t.months[4],
        Jun: t.months[5],
        Jul: t.months[6],
        Aug: t.months[7],
        Sep: t.months[8],
        Oct: t.months[9],
        Nov: t.months[10],
        Dec: t.months[11],
    };
    const xCategories =
        categories?.length > 0
            ? categories.map((category) => monthMap[category] ?? category)
            : t.months;

    // Build tooltip formatters dynamically from series names
    // const tooltipFormatters = (series || []).map((s: any) => ({
    //     formatter: (y: any) =>
    //         typeof y !== "undefined" ? `${y.toFixed(0)} ${s.name || ""}` : y,
    // }));

    const translatedSeries = series.map((item: any) => {
        let translatedName = item.name;

        if (item.name === "Pads") {
            translatedName = t.pads;
        } else if (item.name === "Recordings") {
            translatedName = t.recordings;
        } else if (item.name === "Kirtans") {
            translatedName = t.kirtans;
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
            toolbar: { show: false },
        },
        stroke: {
            curve: "straight",
            dashArray: [0, 0, 8],
            width: [2, 0, 2.2],
        },
        fill: { opacity: [0.1, 0.9, 1] },
        markers: {
            size: [0, 0, 0],
            strokeWidth: 2,
            hover: { size: 4 },
        },
        xaxis: {
            categories: xCategories,
            axisTicks: { show: false },
            axisBorder: { show: false },
        },
        yaxis: {
            labels: {
                formatter: (value: number) => {
                    return gujaratiNumber(value, locale);
                },
            },
        },
        grid: {
            show: true,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } },
            padding: { top: 0, right: -2, bottom: 15, left: 10 },
        },
        legend: {
            show: true,
            horizontalAlign: "center",
            offsetX: 0,
            offsetY: -5,
            markers: { width: 9, height: 9, radius: 6 },
            itemMargin: { horizontal: 10, vertical: 0 },
        },
        plotOptions: {
            bar: { columnWidth: "30%", barHeight: "70%" },
        },
        colors,
        tooltip: {
            shared: true,
            y: [
                {
                    formatter: (y: any) =>
                        typeof y !== "undefined"
                            ? `${gujaratiNumber(y, locale)} ${t.pads}`
                            : y,
                },
                {
                    formatter: (y: any) =>
                        typeof y !== "undefined"
                            ? `${gujaratiNumber(y, locale)} ${t.recordings}`
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

const CategoryVisitsCharts = ({
    dataColors,
    labels = [],
    series = [],
}: any) => {
    const { locale } = usePage<PageProps>().props;
    const colors = getChartColorsArray(dataColors);
    const options: any = {
        labels: labels ?? ["No data"],
        chart: { height: 333, type: "donut" },
        legend: { position: "bottom" },
        stroke: { show: false },
        dataLabels: {
            enabled: true,
            formatter: (value: number) => {
                return `${gujaratiNumber(value.toFixed(1), locale)}%`;
            },
            dropShadow: { enabled: false },
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
