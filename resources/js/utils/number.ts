// resources/js/utils/number.ts

export const gujaratiNumber = (
    value: number | string,
    locale: string,
): string => {
    const formatted = String(value);
    if (locale !== "gu") {
        return String(value);
    }

    const digits = ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"];

    return formatted.replace(/\d/g, (digit) => digits[Number(digit)]);
};
