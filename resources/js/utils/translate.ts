// resources/js/utils/translate.ts

export const t = (
    value: any,
    locale: string = "en"
): string => {
    if (!value) return "";

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);

            if (typeof parsed === "object") {
                return (
                    parsed[locale] ??
                    parsed.en ??
                    Object.values(parsed)[0] ??
                    ""
                );
            }

            return value;
        } catch {
            return value;
        }
    }

    if (typeof value === "object") {
        return (
            value[locale] ??
            value.en ??
            Object.values(value)[0] ??
            ""
        );
    }

    return String(value);
};