// resources/js/hooks/useTranslation.ts
import { usePage } from "@inertiajs/react";

export function useTranslation() {
    const page = usePage().props as {
        translations?: Record<string, string>;
        locale?: string;
    };

    const translations = page.translations ?? {};
    const locale = page.locale ?? "gu";

    const t = (key: string, replace: Record<string, string | number> = {}) => {
        let text = translations[key] ?? key;

        Object.entries(replace).forEach(([k, v]) => {
            text = text.replace(new RegExp(`:${k}`, "g"), String(v));
        });

        return text;
    };

    return {
        t,
        locale,
        isGu: locale === "gu",
    };
}