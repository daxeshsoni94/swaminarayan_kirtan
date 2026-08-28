// resources/js/Components/LanguageSwitcher.tsx
import React from "react";
import { router, usePage } from "@inertiajs/react";

const LanguageSwitcher = () => {
    const { locale } = usePage().props as any;
    console.log("current locale prop:", locale);
    const changeLanguage = (newLocale: string) => {
        router.post("/locale", { locale: newLocale }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <div className="d-flex align-items-center bg-white border rounded-pill p-1 shadow-sm">
            <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`btn btn-sm rounded-pill px-3 ${
                    locale === "en" ? "btn-primary text-white" : "btn-light text-muted"
                }`}
            >
                EN
            </button>

            <button
                type="button"
                onClick={() => changeLanguage("gu")}
                className={`btn btn-sm rounded-pill px-3 ${
                    locale === "gu" ? "btn-primary text-white" : "btn-light text-muted"
                }`}
            >
                ગુજ
            </button>
        </div>
    );
};

export default LanguageSwitcher;