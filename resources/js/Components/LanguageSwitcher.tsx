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

    const locale = (page.locale || "gu").toLowerCase();
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

        const url = new URL(window.location.href);
        const customType = url.searchParams.get("custom_type");

        router.post(
            route("locale.change"),
            {
                locale: newLocale,
                // send current custom_type so backend can map it
                custom_type: customType || undefined,
                // optional: current path for redirect
                redirect_to: url.pathname + url.search,
            },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: (page) => {
                    setIsOpen(false);

                    // If backend returns a new URL / mapped custom_type, use it
                    const mapped =
                        (page?.props as any)?.mapped_custom_type ||
                        null;

                    if (customType) {
                        const next = new URL(window.location.href);
                        if (mapped) {
                            next.searchParams.set("custom_type", mapped);
                        }
                        // Force visit so list reloads with new locale + type label
                        router.visit(next.pathname + next.search, {
                            preserveState: false,
                            replace: true,
                        });
                    }
                },
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