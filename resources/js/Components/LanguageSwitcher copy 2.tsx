import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { router, usePage } from "@inertiajs/react";

type Lang = {
    id: number;
    code: string;
    name: string | { en?: string; gu?: string };
};

const LanguageSwitcher = () => {
    const page = usePage().props as any;

    // console.log("=== LanguageSwitcher Debug ===");
    // console.log("Full props keys:", Object.keys(page));
    // console.log("page.languages:", page.languages);
    // console.log("Type of page.languages:", typeof page.languages);
    // console.log("Is Array?", Array.isArray(page.languages));
    // console.log("Length:", page.languages?.length);

    const locale = (page.locale || "gu").toLowerCase();
    // const languages = page.languages ?? [];
    const languages = Array.isArray(page.availableLanguages)
        ? page.availableLanguages
        : [];
    const [isOpen, setIsOpen] = useState(false);

    const labelFor = (lang: Lang) => {
        if (typeof lang.name === "string") return lang.name;
        return (
            lang.name?.[locale] ??
            lang.name?.en ??
            lang.name?.gu ??
            lang.code.toUpperCase()
        );
    };

    const shortLabel = (code: string) => {
        if (code === "gu") return "ગુજ";
        return code.toUpperCase();
    };

    const changeLanguage = (newLocale: string) => {
        if (newLocale === locale) {
            setIsOpen(false);
            return;
        }

        // Public route — works on login AND admin
        router.post(
            route("locale.change"),
            { locale: newLocale },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => setIsOpen(false),
            },
        );
    };

    return (
        <Dropdown
            show={isOpen}
            onToggle={(nextShow) => setIsOpen(!!nextShow)}
            className="ms-1 topbar-head-dropdown header-item"
        >
            <Dropdown.Toggle
                className="btn btn-icon btn-topbar text-white rounded-circle arrow-none"
                as="button"
            >
                <span className="fw-semibold" style={{ fontSize: "12px" }}>
                    {shortLabel(locale)}
                </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="notify-item language py-2">
                {languages.map((lang) => {
                    const code = (lang.code || "").toLowerCase();
                    return (
                        <Dropdown.Item
                            key={lang.id}
                            onClick={() => changeLanguage(code)}
                            className={`notify-item ${
                                locale === code ? "active" : ""
                            }`}
                        >
                            <span className="align-middle">
                                {labelFor(lang)}
                            </span>
                        </Dropdown.Item>
                    );
                })}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSwitcher;
