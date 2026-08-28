import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, usePage } from "@inertiajs/react";

// images
import avatar1 from "../../../images/users/avatar-1.jpg";

const ProfileDropdown = () => {
    const { auth, locale } = usePage().props as {
        auth: {
            user: {
                name: string | Record<string, string>;
                profile: string | null;
                role?: {
                    name: string;
                } | null;
            };
        };
        locale: string;
    };

    const user = auth.user;

    // Resolve username (supports translatable name object)
    const username =
        typeof user.name === "object"
            ? (user.name?.[locale as "en" | "gu"] ??
              user.name?.en ??
              user.name?.gu ??
              "")
            : (user.name ?? "");

    // Resolve role name
    const roleName = user.role?.name ?? "";

    // ─── Translations ────────────────────────────────────────────────
    const t: Record<string, { en: string; gu: string }> = {
        Welcome: { en: "Welcome", gu: "સ્વાગત છે" },
        "Edit Profile": { en: "Edit Profile", gu: "પ્રોફાઇલ એડિટ કરો" },
        Settings: { en: "Settings", gu: "સેટિંગ્સ" },
        Help: { en: "Help", gu: "મદદ" },
        Logout: { en: "Logout", gu: "લોગઆઉટ" },
        New: { en: "New", gu: "નવું" },

        // Common roles (add more as needed)
        Admin: { en: "Admin", gu: "એડમિન" },
        Founder: { en: "Founder", gu: "સ્થાપક" },
        User: { en: "User", gu: "વપરાશકર્તા" },
        Editor: { en: "Editor", gu: "સંપાદક" },
        Manager: { en: "Manager", gu: "મેનેજર" },
    };

    const tr = (key: string) =>
        t[key]?.[locale as "en" | "gu"] ?? t[key]?.en ?? key;

    // Show translated role if available, otherwise the raw role name
    const displayRole = roleName ? tr(roleName) : "";

    // Dropdown Toggle
    const [isProfileDropdown, setIsProfileDropdown] = useState<boolean>(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };

    return (
        <React.Fragment>
            <Dropdown
                show={isProfileDropdown}
                onClick={toggleProfileDropdown}
                className="ms-sm-3 header-item topbar-user"
            >
                <Dropdown.Toggle
                    as="button"
                    type="button"
                    className="arrow-none btn"
                >
                    <span className="d-flex align-items-center">
                        <img
                            className="rounded-circle header-profile-user"
                            src={
                                user.profile
                                    ? `/storage/${user.profile}`
                                    : avatar1
                            }
                            alt="Header Avatar"
                        />
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                                {username}
                            </span>
                            {displayRole && (
                                <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
                                    {displayRole}
                                </span>
                            )}
                        </span>
                    </span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-menu-end">
                    <h6 className="dropdown-header">
                        {tr("Welcome")} {username}!
                    </h6>

                    <Dropdown.Item
                        href={route("profile.edit")}
                        className="dropdown-item"
                    >
                        <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                        <span className="align-middle">
                            {tr("Edit Profile")}
                        </span>
                    </Dropdown.Item>

                    <Link
                        className="dropdown-item"
                        as="button"
                        method="post"
                        href={route("logout")}
                    >
                        <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
                        <span className="align-middle" data-key="t-logout">
                            {tr("Logout")}
                        </span>
                    </Link>
                </Dropdown.Menu>
            </Dropdown>
        </React.Fragment>
    );
};

export default ProfileDropdown;