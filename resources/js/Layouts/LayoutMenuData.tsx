import React, { useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import { usePermission } from "../hooks/usePermission";

const Navdata = () => {
    const {
        locale,
        rolePrefix,
        translations = {},
        categoryTypes = [],
    } = usePage().props as {
        locale: string;
        rolePrefix: string;
        translations?: Record<string, string>;
        categoryTypes?: any[];
    };

    const { can } = usePermission();

    const tr = useMemo(() => {
        return (key: string) => translations[key] ?? key;
    }, [translations]);

    const [isDashboard, setIsDashboard] = useState(false);
    const [isKirtans, setIsKirtans] = useState(false);
    const [isCategories, setIsCategories] = useState(false);
    const [isUsers, setIsUsers] = useState(false);
    const [isPages, setIsPages] = useState(false);
    const [isContacts, setIsContacts] = useState(false);
    const [isMedia, setIsMedia] = useState(false);
    const [isSettings, setIsSettings] = useState(false);
    const [iscurrentState, setIscurrentState] = useState("Dashboard");

    function updateIconSidebar(e: any) {
        if (e && e.target && e.target.getAttribute("sub-items")) {
            const ul: any = document.getElementById("two-column-menu");
            if (!ul) return;

            const iconItems: any = ul.querySelectorAll(".nav-icon.active");
            [...iconItems].forEach((item: any) => {
                item.classList.remove("active");
                const id = item.getAttribute("sub-items");
                const getID: any = document.getElementById(id) as HTMLElement;
                if (getID) {
                    getID?.parentElement.classList.remove("show");
                }
            });
        }
    }

    useEffect(() => {
        document.body.classList.remove("twocolumn-panel");
        if (iscurrentState !== "Dashboard") setIsDashboard(false);
        if (iscurrentState !== "Kirtans") setIsKirtans(false);
        if (iscurrentState !== "Categories") setIsCategories(false);
        if (iscurrentState !== "Users") setIsUsers(false);
        if (iscurrentState !== "Pages") setIsPages(false);
        if (iscurrentState !== "Contacts") setIsContacts(false);
        if (iscurrentState !== "Media") setIsMedia(false);
        if (iscurrentState !== "Settings") setIsSettings(false);
    }, [
        iscurrentState,
        isDashboard,
        isKirtans,
        isCategories,
        isUsers,
        isPages,
        isContacts,
        isMedia,
        isSettings,
    ]);

    const menuItems: any[] = [{ label: tr("menu"), isHeader: true }];

    // Dashboard
    if (can("dashboard", "view")) {
        menuItems.push({
            id: "dashboard",
            label: tr("dashboard"),
            englishLabel: "Dashboard",
            icon: "bx bxs-dashboard",
            link: route("role.dashboard.index", { rolePrefix }),
            stateVariables: isDashboard,
            click: (e: any) => {
                e.preventDefault();
                setIsDashboard(!isDashboard);
                setIscurrentState("Dashboard");
                updateIconSidebar(e);
            },
        });
    }

    // Kirtans
    if (can("pads", "view")) {
        menuItems.push(
            { label: tr("kirtan_management"), isHeader: true },
            {
                id: "Kirtans",
                label: tr("kirtans"),
                englishLabel: "Kirtans",
                icon: "bx bx-music",
                link: route("role.pads.list", { rolePrefix }),
                stateVariables: isKirtans,
                click: (e: any) => {
                    e.preventDefault();
                    setIsKirtans(!isKirtans);
                    setIscurrentState("Kirtans");
                    updateIconSidebar(e);
                },

                subItems: [
                    {
                        id: "pads-list",
                        label: tr("pads") || tr("kirtans"),
                        englishLabel: "Pads",
                        link: route("role.pads.list", { rolePrefix }),
                        parentId: "Kirtans",
                    },
                    {
                        id: "pads-favorites",
                        label: tr("favorite_pads") || tr("my_favorite_pads"),
                        englishLabel: "Favorite Pads",
                        link: route("role.pads.favorites", { rolePrefix }),
                        parentId: "Kirtans",
                    },
                ],
            },
        );
    }

    // Categories
    if (can("categories", "view")) {
        // Put fixed "custom" last
        const sortedCategoryTypes = [...categoryTypes].sort(
            (a: any, b: any) => {
                if (a.id === "custom") return 1;
                if (b.id === "custom") return -1;
                return 0;
            },
        );

        menuItems.push(
            { label: tr("categories"), isHeader: true },
            {
                id: "categories",
                label: tr("categories"),
                englishLabel: "Categories",
                icon: "bx bx-collection",
                link: "/#",
                stateVariables: isCategories,
                click: (e: any) => {
                    e.preventDefault();
                    setIsCategories(!isCategories);
                    setIscurrentState("Categories");
                    updateIconSidebar(e);
                },
                subItems: sortedCategoryTypes
                    .map((cat: any) => {
                        // Dynamic DB type: Kirtan type, abc, ...
                        // URL: /admin/categories/custom?custom_type=...
                        if (cat.is_dynamic) {
                            const base = route("role.category.list", {
                                rolePrefix,
                                type: "custom",
                            });
                            const qs = cat.custom_type
                                ? `?custom_type=${encodeURIComponent(cat.custom_type)}`
                                : "";

                            return {
                                id: `cat-${cat.id}`,
                                label: cat.label,
                                englishLabel: cat.english_label,
                                link: `${base}${qs}`,
                                parentId: "categories",
                            };
                        }

                        // Fixed Custom Category (all custom, no filter)
                        if (cat.id === "custom") {
                            if (!can("categories", "custom")) {
                                return null;
                            }
                            return {
                                id: "cat-custom",
                                label: tr(cat.translation_key),
                                englishLabel: cat.english_label,
                                searchTerms: cat.search_terms,
                                link: route("role.category.list", {
                                    rolePrefix,
                                    type: "custom",
                                }),
                                parentId: "categories",
                            };
                        }

                        // Fixed types: creator, event, place, ...
                        return {
                            id: `cat-${cat.id}`,
                            label: tr(cat.translation_key),
                            englishLabel: cat.english_label,
                            searchTerms: cat.search_terms,
                            link: route("role.category.list", {
                                rolePrefix,
                                type: cat.id,
                            }),
                            parentId: "categories",
                        };
                    })
                    .filter(Boolean),
            },
        );
    }

    // User Management
    if (
        can("users", "view") ||
        can("roles", "view") ||
        can("languages", "view")
    ) {
        const userManagementSubItems = [
            can("users", "view") && {
                id: "Users",
                label: tr("all_users"),
                link: route("role.users.list", { rolePrefix }),
                parentId: "users",
            },
            can("roles", "view") && {
                id: "users-roles",
                label: tr("roles"),
                link: route("role.roles.list", { rolePrefix }),
                parentId: "users",
            },
            can("languages", "view") && {
                id: "users-languages",
                label: tr("languages"),
                link: route("role.languages.list", { rolePrefix }),
                parentId: "users",
            },
        ].filter(Boolean);

        menuItems.push(
            { label: tr("user_management"), isHeader: true },
            {
                id: "users",
                label: tr("users"),
                englishLabel: "Users",
                icon: "bx bx-group",
                link: "/#",
                stateVariables: isUsers,
                click: (e: any) => {
                    e.preventDefault();
                    setIsUsers(!isUsers);
                    setIscurrentState("Users");
                    updateIconSidebar(e);
                },
                subItems: userManagementSubItems,
            },
        );
    }

    // Pages
    if (can("pages", "view")) {
        menuItems.push(
            { label: tr("content"), isHeader: true },
            {
                id: "pages",
                label: tr("pages"),
                englishLabel: "Pages",
                icon: "bx bx-book-content",
                link: "/#",
                stateVariables: isPages,
                click: (e: any) => {
                    e.preventDefault();
                    setIsPages(!isPages);
                    setIscurrentState("Pages");
                    updateIconSidebar(e);
                },
                subItems: [
                    {
                        id: "pages-list",
                        label: tr("list_title_all"),
                        link: route("role.pages.list", { rolePrefix }),
                        parentId: "pages",
                    },
                    {
                        id: "pages-published",
                        label: tr("list_title_published"),
                        link: route("role.pages.published", { rolePrefix }),
                        parentId: "pages",
                    },
                    {
                        id: "pages-draft",
                        label: tr("list_title_drafts"),
                        link: route("role.pages.drafts", { rolePrefix }),
                        parentId: "pages",
                    },
                ],
            },
        );
    }

    // Contacts
    if (can("contacts", "view")) {
        menuItems.push({
            id: "contacts",
            label: tr("contacts"),
            englishLabel: "Contacts",
            icon: "bx bx-envelope",
            link: "/#",
            stateVariables: isContacts,
            click: (e: any) => {
                e.preventDefault();
                setIsContacts(!isContacts);
                setIscurrentState("Contacts");
                updateIconSidebar(e);
            },
            subItems: [
                {
                    id: "contacts-all",
                    label: tr("contacts_all"),
                    link: route("role.contacts.list", { rolePrefix }),
                    parentId: "contacts",
                },
                {
                    id: "contacts-new",
                    label: tr("contacts_new"),
                    link: route("role.contacts.new", { rolePrefix }),
                    parentId: "contacts",
                },
                {
                    id: "contacts-read",
                    label: tr("contacts_read"),
                    link: route("role.contacts.read", { rolePrefix }),
                    parentId: "contacts",
                },
                {
                    id: "contacts-resolved",
                    label: tr("contacts_resolved"),
                    link: route("role.contacts.resolved", { rolePrefix }),
                    parentId: "contacts",
                },
            ],
        });
    }

    // Settings
    if (can("settings", "view")) {
        menuItems.push(
            { label: tr("system"), isHeader: true },
            {
                id: "settings-general",
                label: tr("general_settings"),
                englishLabel: "Settings",
                icon: "bx bx-cog",
                link: route("role.settings.index", { rolePrefix }),
            },
        );
    }

    return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;
