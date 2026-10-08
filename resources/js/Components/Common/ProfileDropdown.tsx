import React, { useState } from "react";

import { Dropdown } from "react-bootstrap";

import { Link, usePage } from "@inertiajs/react";

// images
import avatar1 from "../../../images/users/avatar-1.jpg";
import RightSidebar from "./RightSidebar";

type UserRole = {
    name: string | Record<string, string>;
};

type User = {
    name: string | Record<string, string>;
    profile: string | null;
    role?: UserRole | null;
};

type PageProps = {
    auth: {
        user: User;
    };
    locale?: string;
    translations?: Record<string, string>;
};

const ProfileDropdown = () => {
    const page = usePage<PageProps>();

    const {
        auth,
        locale = "gu",
        translations = {},
    } = page.props;

    const user = auth.user;

    /**
     * Central translation helper
     *
     * All translations come from Laravel/Inertia.
     */
    const tr = (key: string) => {
        return translations[key] ?? key;
    };

    /**
     * Resolve translated value from a JSON field.
     *
     * Example:
     * {
     *   en: "Daxesh",
     *   gu: "દક્ષેશ"
     * }
     */
    const resolveLocalizedValue = (
        value: string | Record<string, string> | null | undefined,
    ): string => {
        if (!value) {
            return "";
        }

        if (typeof value === "string") {
            return value;
        }

        return (
            value[locale] ??
            value.en ??
            value.gu ??
            Object.values(value)[0] ??
            ""
        );
    };

    /**
     * Dynamic username
     */
    const username = resolveLocalizedValue(user.name);

    /**
     * Dynamic role
     */
    const roleName = resolveLocalizedValue(user.role?.name);

    /**
     * Role translation.
     *
     * If Laravel already sends the translated role name,
     * this will use it directly.
     *
     * Otherwise it tries:
     *
     * role_admin
     * role_user
     * role_manager
     * etc.
     */
    const getRoleName = (role: string): string => {
        if (!role) {
            return "";
        }

        const roleKey = `role_${role
            .toLowerCase()
            .replace(/\s+/g, "_")}`;

        return translations[roleKey] ?? role;
    };

    const displayRole = getRoleName(roleName);

    const [isProfileDropdown, setIsProfileDropdown] =
        useState<boolean>(false);

    return (
        <Dropdown
            show={isProfileDropdown}
            onToggle={(nextShow) => setIsProfileDropdown(!!nextShow)}
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
                        alt={tr("profile")}
                        onError={(e) => {
                            e.currentTarget.src = avatar1;
                        }}
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
                {/* Welcome */}
                <h6 className="dropdown-header">
                    {tr("welcome")} {username}!
                </h6>

                {/* Edit Profile */}
                <Dropdown.Item
                    href={route("profile.edit")}
                    className="dropdown-item"
                >
                    <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>

                    <span className="align-middle">
                        {tr("edit_profile")}
                    </span>
                </Dropdown.Item>

                {/* Logout */}
                {/* <RightSidebar/> */}
                <Link
                    className="dropdown-item"
                    as="button"
                    method="post"
                    href={route("logout")}
                >
                    <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>

                    <span className="align-middle">
                        {tr("logout")}
                    </span>
                </Link>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default ProfileDropdown;