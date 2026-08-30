import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { usePermission } from "../hooks/usePermission";

const Navdata = () => {
    const { locale, rolePrefix } = usePage().props as {
        locale: string;
        rolePrefix: string;
    };
    const { can } = usePermission();

    // ─── Translations ────────────────────────────────────────────────
    const t: Record<string, { en: string; gu: string }> = {
        Menu: { en: "Menu", gu: "મેનુ" },
        Dashboard: { en: "Dashboard", gu: "ડેશબોર્ડ" },
        "Kirtan Management": {
            en: "Kirtan Management",
            gu: "કીર્તન મેનેજમેન્ટ",
        },
        Kirtans: { en: "Kirtans", gu: "કીર્તનો" },
        Categories: { en: "Categories", gu: "કેટેગરીઝ" },
        Creator: { en: "Creator", gu: "રચયિતા" },
        Event: { en: "Event", gu: "પ્રસંગ" },
        Place: { en: "Place", gu: "સ્થળ" },
        Adjective: { en: "Adjective", gu: "વિશેષણ" },
        Name: { en: "Name", gu: "નામ" },
        Book: { en: "Book", gu: "પુસ્તક" },
        Bhav: { en: "Bhav", gu: "ભાવ" },
        "Favorites Pads": { en: "Favorites Pads", gu: "મનપસંદ પદો" },
        "User Management": { en: "User Management", gu: "યુઝર મેનેજમેન્ટ" },
        Users: { en: "Users", gu: "યુઝર્સ" },
        "All Users": { en: "All Users", gu: "બધા યુઝર્સ" },
        Roles: { en: "Roles", gu: "રોલ્સ" },
        Languages: { en: "Languages", gu: "ભાષાઓ" },
        Content: { en: "Content", gu: "કન્ટેન્ટ" },
        Pages: { en: "Pages", gu: "પેજીસ" },
        "All Pages": { en: "All Pages", gu: "બધા પેજીસ" },
        Published: { en: "Published", gu: "પ્રકાશિત" },
        Drafts: { en: "Drafts", gu: "ડ્રાફ્ટ્સ" },
        Contacts: { en: "Contacts", gu: "સંપર્કો" },
        "All Submissions": { en: "All Submissions", gu: "બધા સબમિશન્સ" },
        New: { en: "New", gu: "નવા" },
        Read: { en: "Read", gu: "વાંચેલા" },
        Resolved: { en: "Resolved", gu: "ઉકેલાયેલા" },
        Media: { en: "Media", gu: "મીડિયા" },
        "All Media": { en: "All Media", gu: "બધા મીડિયા" },
        System: { en: "System", gu: "સિસ્ટમ" },
        Settings: { en: "Settings", gu: "સેટિંગ્સ" },
        "General Settings": { en: "General Settings", gu: "સામાન્ય સેટિંગ્સ" },
    };

    const tr = (key: string) => t[key]?.[locale] ?? t[key]?.en ?? key;

    // ─── State ───────────────────────────────────────────────────────
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
            const iconItems: any = ul.querySelectorAll(".nav-icon.active");
            [...iconItems].forEach((item: any) => {
                item.classList.remove("active");
                const id = item.getAttribute("sub-items");
                const getID: any = document.getElementById(id) as HTMLElement;
                if (getID) getID?.parentElement.classList.remove("show");
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

    // ─── Build menu conditionally ──────────────────────────────────────
    const menuItems: any[] = [{ label: tr("Menu"), isHeader: true }];

    // Dashboard
    if (can("dashboard", "view")) {
        menuItems.push({
            id: "dashboard",
            label: tr("Dashboard"),
            icon: "bx bxs-dashboard",
            link: "/admin/dashboard",
            stateVariables: isDashboard,
            click: (e: any) => {
                e.preventDefault();
                setIsDashboard(!isDashboard);
                setIscurrentState("Dashboard");
                updateIconSidebar(e);
            },
        });
    }

    // ── Kirtan Management (Pads) ─────────────────────────────────────
    if (can("pads", "view")) {
        menuItems.push(
            { label: tr("Kirtan Management"), isHeader: true },
            {
                id: "Kirtans",
                label: tr("Kirtans"),
                icon: "bx bx-music",
                link: route("role.pads.list", {
                    rolePrefix: rolePrefix,
                }),
                stateVariables: isKirtans,
                click: (e: any) => {
                    e.preventDefault();
                    setIsKirtans(!isKirtans);
                    setIscurrentState("Kirtans");
                    updateIconSidebar(e);
                },
            },
        );
    }

    // ── Categories ────────────────────────────────────────────────────
    if (can("categories", "view")) {
        menuItems.push(
            { label: tr("Categories"), isHeader: true },
            {
                id: "categories",
                label: tr("Categories"),
                icon: "bx bx-collection",
                link: "/#",
                stateVariables: isCategories,
                click: (e: any) => {
                    e.preventDefault();
                    setIsCategories(!isCategories);
                    setIscurrentState("Categories");
                    updateIconSidebar(e);
                },
                subItems: [
                    {
                        id: "cat-creator",
                        label: tr("Creator"),
                        link: route("role.category.creatorlist", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "categories",
                    },
                    {
                        id: "cat-event",
                        label: tr("Event"),
                        link: route("role.category.eventlist", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "categories",
                    },
                    {
                        id: "cat-place",
                        label: tr("Place"),
                        link: route("role.category.placelist", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "categories",
                    },
                    {
                        id: "cat-adjective",
                        label: tr("Adjective"),
                        link: route("role.category.adjectivelist", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "categories",
                    },
                    {
                        id: "cat-name",
                        label: tr("Name"),
                        link: route("role.category.namelist", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "categories",
                    },
                    {
                        id: "cat-book",
                        label: tr("Book"),
                        link: route("role.category.booklist", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "categories",
                    },
                    {
                        id: "cat-bhav",
                        label: tr("Bhav"),
                        link: route("role.category.bhavlist", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "categories",
                    },

                    {
                        id: "favorites",
                        label: tr("Favorites Pads"),
                        icon: "ri-heart-line",
                        link: route("role.pads.favorites", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "Kirtans",
                    },
                ],
            },
        );
    }

    // ── User Management ───────────────────────────────────────────────
    if (
        can("users", "view") ||
        can("roles", "view") ||
        can("languages", "view")
    ) {
        const userManagementSubItems = [
            can("users", "view") && {
                id: "Users",
                label: tr("All Users"),
                link: route("role.users.list", {
                    rolePrefix: rolePrefix,
                }),
                parentId: "users",
            },
            can("roles", "view") && {
                id: "users-roles",
                label: tr("Roles"),
                link: route("role.roles.list", {
                    rolePrefix: rolePrefix,
                }),
                parentId: "users",
            },
            can("languages", "view") && {
                id: "users-languages",
                label: tr("Languages"),
                link: route("role.languages.list", {
                    rolePrefix: rolePrefix,
                }),
                parentId: "users",
            },
        ].filter(Boolean);

        menuItems.push(
            { label: tr("User Management"), isHeader: true },
            {
                id: "users",
                label: tr("Users"),
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

    // ── Content / Pages ───────────────────────────────────────────────
    if (can("pages", "view")) {
        menuItems.push(
            { label: tr("Content"), isHeader: true },
            {
                id: "pages",
                label: tr("Pages"),
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
                        label: tr("All Pages"),
                        link: route("role.pages.list", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "pages",
                    },
                    {
                        id: "pages-published",
                        label: tr("Published"),
                        link: route("role.pages.published", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "pages",
                    },
                    {
                        id: "pages-draft",
                        label: tr("Drafts"),
                        link: route("role.pages.drafts", {
                            rolePrefix: rolePrefix,
                        }),
                        parentId: "pages",
                    },
                ],
            },
        );
    }

    // ── Contacts (separate permission) ────────────────────────────────
    if (can("contacts", "view")) {
        menuItems.push({
            id: "contacts",
            label: tr("Contacts"),
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
                    label: tr("All Submissions"),
                    link: route("role.contacts.list", {
                        rolePrefix: rolePrefix,
                    }),
                    parentId: "contacts",
                },
                {
                    id: "contacts-new",
                    label: tr("New"),
                    link: route("role.contacts.new", {
                        rolePrefix: rolePrefix,
                    }),
                    parentId: "contacts",
                },
                {
                    id: "contacts-read",
                    label: tr("Read"),
                    link: route("role.contacts.read", {
                        rolePrefix: rolePrefix,
                    }),
                    parentId: "contacts",
                },
                {
                    id: "contacts-resolved",
                    label: tr("Resolved"),
                    link: route("role.contacts.resolved", {
                        rolePrefix: rolePrefix,
                    }),
                    parentId: "contacts",
                },
            ],
        });
    }

    // ── Media ─────────────────────────────────────────────────────────
    // if (can("media", "view")) {
    //     menuItems.push(
    //         { label: tr("Media"), isHeader: true },
    //         {
    //             id: "media",
    //             label: tr("Media"),
    //             icon: "bx bx-images",
    //             link: "/admin/media",
    //             stateVariables: isMedia,
    //             click: (e: any) => {
    //                 e.preventDefault();
    //                 setIsMedia(!isMedia);
    //                 setIscurrentState("Media");
    //                 updateIconSidebar(e);
    //             },
    //         },
    //     );
    // }

    // ── System / Settings ─────────────────────────────────────────────
    if (can("settings", "view")) {
        menuItems.push(
            { label: tr("System"), isHeader: true },

            {
                id: "settings-general",
                label: tr("General Settings"),
                icon: "bx bx-cog",
                link: "/admin/settings",
            },
        );
    }
    return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;
