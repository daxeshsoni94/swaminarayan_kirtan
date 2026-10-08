import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Col, Collapse, Row } from "react-bootstrap";

// Import Data
import navdata from "../LayoutMenuData";
//i18n
import { withTranslation } from "react-i18next";
import { Link, usePage } from "@inertiajs/react";
import { usePermission } from "../../hooks/usePermission";

const HorizontalLayout = (props: any) => {
    const { can } = usePermission();
    const { locale, menuPages = [], translations = {} } = usePage().props as {
        locale: string;
        menuPages?: { id: number; title: string; slug: string }[];
        translations?: Record<string, string>;
    };

    const tr = (key: string) => translations[key] ?? key;



    const [isMoreMenu, setIsMoreMenu] = useState<boolean>(false);
    const [categorySearch, setCategorySearch] = useState("");
    const navData = navdata().props.children ?? [];

    let menuItems: any[] = [];
    let splitMenuItems: any[] = [];
    let menuSplitContainer = 6;

    navData.forEach((value: any, key: number) => {
        if (value?.isHeader) {
            menuSplitContainer++;
        }

        if (key >= menuSplitContainer) {
            const val = {
                ...value,
                childItems: value.subItems ?? [],
                isChildItem: !!value.subItems,
            };

            splitMenuItems.push(val);
        } else {
            menuItems.push(value);
        }
    });

    // ── Dynamic pages → add into More menu ───────────────────────────
    // const dynamicPageItems = (menuPages || []).map((page) => ({
    //     id: `page-${page.id}`,
    //     label: page.title, // already in the language you stored
    //     link: route("pages.show", page.slug),
    //     // no subItems → treated as simple link
    // }));

    // Put dynamic pages at the top of the More dropdown (or at the end)
    // const moreSubItems = [...dynamicPageItems, ...splitMenuItems];
    const moreSubItems = splitMenuItems.filter(
        (item: any) =>
            item.id === "settings-general" ||
            item.label === "General Settings" ||
            (typeof item.label === "string" &&
                item.label.toLowerCase().includes("general settings")),
    );

    if (can("more", "view") && moreSubItems.length > 0) {
        menuItems.push({
            id: "more",
            label: tr("More"),
            icon: "ri-briefcase-2-line",
            link: "/#",
            stateVariables: isMoreMenu,
            subItems: moreSubItems, // ← now includes dynamic pages
            click: function (e: any) {
                e.preventDefault();
                setIsMoreMenu(!isMoreMenu);
            },
        });
    }

    const path = window.location.pathname + window.location.search;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const initMenu = () => {
            const pathName = path;
            const ul = document.getElementById("navbar-nav") as HTMLElement;
            if (!ul) return;
            const items: any = ul.getElementsByTagName("a");
            let itemsArray = [...items]; // converts NodeList to Array
            removeActivation(itemsArray);
            let matchingMenuItem = itemsArray.find((x) => {
                try {
                    const current = new URL(window.location.href);
                    const target = new URL(x.href, window.location.origin);

                    if (current.pathname !== target.pathname) {
                        return false;
                    }

                    const currentType = (
                        current.searchParams.get("custom_type") || ""
                    )
                        .trim()
                        .toLowerCase();
                    const targetType = (
                        target.searchParams.get("custom_type") || ""
                    )
                        .trim()
                        .toLowerCase();

                    // Exact match on custom_type (both empty = generic Custom Category)
                    return currentType === targetType;
                } catch {
                    return x.pathname === pathName;
                }
            });
            if (matchingMenuItem) {
                activateParentDropdown(matchingMenuItem);
            }
        };
        initMenu();
    }, [path, props.layoutType]);

    function activateParentDropdown(item: any) {
        item.classList.add("active");
        let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

        if (parentCollapseDiv) {
            // to set aria expand true remaining
            parentCollapseDiv.classList.add("show");
            parentCollapseDiv.parentElement.children[0].classList.add("active");
            parentCollapseDiv.parentElement.children[0].setAttribute(
                "aria-expanded",
                "true",
            );
            if (
                parentCollapseDiv.parentElement.closest(
                    ".collapse.menu-dropdown",
                )
            ) {
                parentCollapseDiv.parentElement
                    .closest(".collapse")
                    .classList.add("show");
                var parentElementDiv =
                    parentCollapseDiv.parentElement.closest(
                        ".collapse",
                    ).previousElementSibling;
                if (parentElementDiv)
                    if (parentElementDiv.closest(".collapse"))
                        parentElementDiv
                            .closest(".collapse")
                            .classList.add("show");
                parentElementDiv.classList.add("active");
                var parentElementSibling =
                    parentElementDiv.parentElement.parentElement.parentElement
                        .previousElementSibling;
                if (parentElementSibling) {
                    parentElementSibling.classList.add("active");
                }
            }
            return false;
        }
        return false;
    }

    const removeActivation = (items: any) => {
        let actiItems = items.filter((x: any) =>
            x.classList.contains("active"),
        );

        actiItems.forEach((item: any) => {
            if (item.classList.contains("menu-link")) {
                if (!item.classList.contains("active")) {
                    item.setAttribute("aria-expanded", false);
                }
                if (item.nextElementSibling) {
                    item.nextElementSibling.classList.remove("show");
                }
            }
            if (item.classList.contains("nav-link")) {
                if (item.nextElementSibling) {
                    item.nextElementSibling.classList.remove("show");
                }
                item.setAttribute("aria-expanded", false);
            }
            item.classList.remove("active");
        });
    };
    return (
        <React.Fragment>
            {(menuItems || []).map((item: any, key: number) => {
                return (
                    <React.Fragment key={key}>
                        {/* Main Header */}
                        {!item["isHeader"] ? (
                            item.subItems ? (
                                <li className="nav-item">
                                    <Link
                                        onClick={item.click}
                                        className="nav-link menu-link"
                                        href={item.link ? item.link : "/#"}
                                        data-bs-toggle="collapse"
                                    >
                                        <i className={item.icon}></i>{" "}
                                        <span data-key="t-apps">
                                            {props.t(item.label)}
                                        </span>
                                    </Link>
                                    <Collapse
                                        className={
                                            item.id === "baseUi" &&
                                            item.subItems.length > 13
                                                ? "menu-dropdown mega-dropdown-menu"
                                                : "menu-dropdown"
                                        }
                                        in={item.stateVariables}
                                    >
                                        {/* subItms  */}
                                        {item.id === "baseUi" &&
                                        item.subItems.length > 13 ? (
                                            <React.Fragment>
                                                <div className="menu-dropdown mega-dropdown-menu">
                                                    <Row>
                                                        {item.subItems &&
                                                            (
                                                                item.subItems ||
                                                                []
                                                            ).map(
                                                                (
                                                                    subItem: any,
                                                                    key: number,
                                                                ) => (
                                                                    <React.Fragment
                                                                        key={
                                                                            key
                                                                        }
                                                                    >
                                                                        {key %
                                                                            2 ===
                                                                        0 ? (
                                                                            <Col
                                                                                lg={
                                                                                    4
                                                                                }
                                                                            >
                                                                                <ul className="nav nav-sm flex-column">
                                                                                    <li className="nav-item">
                                                                                        <Link
                                                                                            href={
                                                                                                item
                                                                                                    .subItems[
                                                                                                    key
                                                                                                ]
                                                                                                    .link
                                                                                            }
                                                                                            className="nav-link"
                                                                                        >
                                                                                            {
                                                                                                item
                                                                                                    .subItems[
                                                                                                    key
                                                                                                ]
                                                                                                    .label
                                                                                            }
                                                                                        </Link>
                                                                                    </li>
                                                                                </ul>
                                                                            </Col>
                                                                        ) : (
                                                                            <Col
                                                                                lg={
                                                                                    4
                                                                                }
                                                                            >
                                                                                <ul className="nav nav-sm flex-column">
                                                                                    <li className="nav-item">
                                                                                        <Link
                                                                                            href={
                                                                                                item
                                                                                                    .subItems[
                                                                                                    key
                                                                                                ]
                                                                                                    .link
                                                                                            }
                                                                                            className="nav-link"
                                                                                        >
                                                                                            {
                                                                                                item
                                                                                                    .subItems[
                                                                                                    key
                                                                                                ]
                                                                                                    .label
                                                                                            }
                                                                                        </Link>
                                                                                    </li>
                                                                                </ul>
                                                                            </Col>
                                                                        )}
                                                                    </React.Fragment>
                                                                ),
                                                            )}
                                                    </Row>
                                                </div>
                                            </React.Fragment>
                                        ) : (
                                            <ul className="nav nav-sm flex-column test">
                                                {item.id === "categories" && (
                                                    <li className="nav-item px-3 py-2">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder={tr("Search") + "..."}
                                                            value={categorySearch}
                                                            onChange={(e) => setCategorySearch(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </li>
                                                )}
                                                <div style={item.id === "categories" ? { maxHeight: "280px", overflowY: "auto" } : {}}>
                                                {item.subItems &&
                                                    (item.subItems || [])
                                                        .filter((subItem: any) => {
                                                            if (item.id !== "categories" || !categorySearch) return true;

                                                            const phoneticMap: Record<string, string[]> = {
                                                                "રચયિતા": ["rachyita", "rachayita", "creator", "rachaita"],
                                                                "પ્રસંગ": ["prasang", "event"],
                                                                "સ્થળ": ["sthal", "place"],
                                                                "વિશેષણ": ["visheshan", "adjective"],
                                                                "નામ": ["naam", "name"],
                                                                "પુસ્તક": ["pustak", "book"],
                                                                "ભાવ": ["bhav"],
                                                                "કીર્તન પ્રકાર": ["kirtan prakar", "kirtan type", "type"],
                                                                "વિવેચન": ["vivechan"],
                                                                "ઉત્પત્તિ": ["utpatti", "origin"],
                                                                "કસ્ટમ કેટેગરી": ["custom category", "custom"],
                                                                "કસ્ટમ": ["custom"]
                                                            };

                                                            const label = String(props.t(subItem.label) || "");
                                                            const labelStr = label.toLowerCase();
                                                            const rawLabelStr = String(subItem.label || "").toLowerCase();
                                                            const englishLabelStr = String(subItem.englishLabel || "").toLowerCase();
                                                            const searchLower = categorySearch.toLowerCase();
                                                            
                                                            if (labelStr.includes(searchLower) || rawLabelStr.includes(searchLower) || englishLabelStr.includes(searchLower)) return true;
                                                            
                                                            // Check phonetic mapping fallback
                                                            for (const [gu, phonetics] of Object.entries(phoneticMap)) {
                                                                if (labelStr.includes(gu) || rawLabelStr.includes(gu)) {
                                                                    if (phonetics.some(p => p.includes(searchLower))) {
                                                                        return true;
                                                                    }
                                                                }
                                                            }

                                                            return false;
                                                        })
                                                        .map(
                                                        (
                                                            subItem: any,
                                                            key: number,
                                                        ) => (
                                                            <React.Fragment
                                                                key={key}
                                                            >
                                                                {!subItem.isChildItem ? (
                                                                    <li className="nav-item">
                                                                        <Link
                                                                            href={
                                                                                subItem.link
                                                                                    ? subItem.link
                                                                                    : "/#"
                                                                            }
                                                                            className="nav-link"
                                                                        >
                                                                            {props.t(
                                                                                subItem.label,
                                                                            )}
                                                                        </Link>
                                                                    </li>
                                                                ) : (
                                                                    <li className="nav-item">
                                                                        <Link
                                                                            onClick={
                                                                                subItem.click
                                                                            }
                                                                            className="nav-link"
                                                                            href="/#"
                                                                            data-bs-toggle="collapse"
                                                                        >
                                                                            {" "}
                                                                            {props.t(
                                                                                subItem.label,
                                                                            )}
                                                                        </Link>
                                                                        <Collapse
                                                                            className="menu-dropdown"
                                                                            in={
                                                                                subItem.stateVariables
                                                                            }
                                                                        >
                                                                            <ul
                                                                                className="nav nav-sm flex-column"
                                                                                id="sidebarEcommerce"
                                                                            >
                                                                                {/* child subItms  */}
                                                                                {subItem.childItems &&
                                                                                    (
                                                                                        subItem.childItems ||
                                                                                        []
                                                                                    ).map(
                                                                                        (
                                                                                            subChildItem: any,
                                                                                            key: number,
                                                                                        ) => (
                                                                                            <React.Fragment
                                                                                                key={
                                                                                                    key
                                                                                                }
                                                                                            >
                                                                                                {!subChildItem.isChildItem ? (
                                                                                                    <li className="nav-item">
                                                                                                        <Link
                                                                                                            href={
                                                                                                                subChildItem.link
                                                                                                                    ? subChildItem.link
                                                                                                                    : "/#"
                                                                                                            }
                                                                                                            className="nav-link"
                                                                                                        >
                                                                                                            {props.t(
                                                                                                                subChildItem.label,
                                                                                                            )}
                                                                                                        </Link>
                                                                                                    </li>
                                                                                                ) : (
                                                                                                    <li className="nav-item">
                                                                                                        <Link
                                                                                                            onClick={
                                                                                                                subChildItem.click
                                                                                                            }
                                                                                                            className="nav-link"
                                                                                                            href="/#"
                                                                                                            data-bs-toggle="collapse"
                                                                                                        >
                                                                                                            {" "}
                                                                                                            {props.t(
                                                                                                                subChildItem.label,
                                                                                                            )}
                                                                                                        </Link>
                                                                                                        <Collapse
                                                                                                            className="menu-dropdown"
                                                                                                            in={
                                                                                                                subChildItem.stateVariables
                                                                                                            }
                                                                                                        >
                                                                                                            <ul
                                                                                                                className="nav nav-sm flex-column"
                                                                                                                id="sidebarEcommerce"
                                                                                                            >
                                                                                                                {/* child subItms  */}
                                                                                                                {subChildItem.childItems &&
                                                                                                                    (
                                                                                                                        subChildItem.childItems ||
                                                                                                                        []
                                                                                                                    ).map(
                                                                                                                        (
                                                                                                                            subSubChildItem: any,
                                                                                                                            key: number,
                                                                                                                        ) => (
                                                                                                                            <li
                                                                                                                                className="nav-item apex"
                                                                                                                                key={
                                                                                                                                    key
                                                                                                                                }
                                                                                                                            >
                                                                                                                                <Link
                                                                                                                                    href={
                                                                                                                                        subSubChildItem.link
                                                                                                                                            ? subSubChildItem.link
                                                                                                                                            : "/#"
                                                                                                                                    }
                                                                                                                                    className="nav-link"
                                                                                                                                >
                                                                                                                                    {props.t(
                                                                                                                                        subSubChildItem.label,
                                                                                                                                    )}
                                                                                                                                </Link>
                                                                                                                            </li>
                                                                                                                        ),
                                                                                                                    )}
                                                                                                            </ul>
                                                                                                        </Collapse>
                                                                                                    </li>
                                                                                                )}
                                                                                            </React.Fragment>
                                                                                        ),
                                                                                    )}
                                                                            </ul>
                                                                        </Collapse>
                                                                    </li>
                                                                )}
                                                            </React.Fragment>
                                                        ),
                                                    )}
                                                </div>
                                            </ul>
                                        )}
                                    </Collapse>
                                </li>
                            ) : (
                                <li className="nav-item">
                                    <Link
                                        className="nav-link menu-link"
                                        href={item.link ? item.link : "/#"}
                                    >
                                        <i className={item.icon}></i>{" "}
                                        <span>{props.t(item.label)}</span>
                                    </Link>
                                </li>
                            )
                        ) : (
                            <li className="menu-title">
                                <span data-key="t-menu">
                                    {props.t(item.label)}
                                </span>
                            </li>
                        )}
                    </React.Fragment>
                );
            })}
            {/* menu Items */}
        </React.Fragment>
    );
};

HorizontalLayout.propTypes = {
    location: PropTypes.object,
    t: PropTypes.any,
};

export default withTranslation()(HorizontalLayout);
