// resources/js/Components/LanguageSwitcher.tsx
import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { router, usePage } from "@inertiajs/react";

const languages: Record<string, { label: string; flag?: string }> = {
    en: {
        label: "English",
        // optional: flag image path
        // flag: "/images/flags/us.svg",
    },
    gu: {
        label: "ગુજરાતી",
        // flag: "/images/flags/in.svg",
    },
};

const LanguageSwitcher = () => {
    const { locale } = usePage().props as { locale?: string };
    // console.log("LANGUAGE SWITCHER:", {
    //     locale,
    //     props: usePage().props,
    // });
    const { auth } = usePage().props as any;
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";
    const currentLocale = locale === "en" ? "en" : "gu";

    const [isOpen, setIsOpen] = useState(false);

    const changeLanguage = (newLocale: string) => {
        if (newLocale === currentLocale) {
            setIsOpen(false);
            return;
        }

        router.post(
            route("role.locale.change", {
                rolePrefix: rolePrefix,
            }),
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
            onToggle={(nextShow) => setIsOpen(nextShow)}
            className="ms-1 topbar-head-dropdown header-item"
        >
            <Dropdown.Toggle
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle arrow-none"
                as="button"
            >
                {/* Text version (no flag images) */}
                <span className="fw-semibold" style={{ fontSize: "12px" }}>
                    {currentLocale === "gu" ? "ગુજ" : "EN"}
                </span>

                {/* OR with flag images (uncomment if you have flags):
                <img
                    src={languages[currentLocale]?.flag}
                    alt="Language"
                    height="20"
                    className="rounded"
                />
                */}
            </Dropdown.Toggle>

            <Dropdown.Menu className="notify-item language py-2">
                {Object.keys(languages).map((key) => (
                    <Dropdown.Item
                        key={key}
                        onClick={() => changeLanguage(key)}
                        className={`notify-item ${
                            currentLocale === key ? "active" : ""
                        }`}
                    >
                        {/* Optional flag:
                        <img
                            src={languages[key].flag}
                            alt={languages[key].label}
                            className="me-2 rounded"
                            height="18"
                        />
                        */}
                        <span className="align-middle">
                            {languages[key].label}
                        </span>
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSwitcher;
