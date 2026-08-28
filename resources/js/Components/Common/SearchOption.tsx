import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Link, usePage } from "@inertiajs/react";
import Navdata from "../../Layouts/LayoutMenuData";
import SimpleBar from "simplebar-react";

// images
import image2 from "../../../images/users/avatar-2.jpg";
import image3 from "../../../images/users/avatar-3.jpg";
import image5 from "../../../images/users/avatar-5.jpg";

const SearchOption = () => {
    const { locale } = usePage().props as { locale: string };

    // ─── Translations ────────────────────────────────────────────────
    const t = {
        "Search...": { en: "Search...", gu: "શોધો..." },
        "Recent Searches": { en: "Recent Searches", gu: "તાજેતરની શોધ" },
        "View All Results": { en: "View All Results", gu: "બધા પરિણામો જુઓ" },
    };

    const tr = (key: string) => t[key]?.[locale] ?? t[key]?.en ?? key;

    // ─── State ───────────────────────────────────────────────────────
    const navData = Navdata().props.children;
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterData, setFilterData] = useState<any[]>([]);

    useEffect(() => {
        const searchOptions = document.getElementById("search-close-options") as HTMLElement;
        const dropdown = document.getElementById("search-dropdown") as HTMLElement;
        const searchInput = document.getElementById("search-options") as HTMLInputElement;

        const handleSearchInput = () => {
            const inputLength = searchInput.value.length;
            if (inputLength > 0) {
                dropdown.classList.add("show");
                searchOptions.classList.remove("d-none");
            } else {
                dropdown.classList.remove("show");
                searchOptions.classList.add("d-none");
            }
        };

        searchInput.addEventListener("focus", handleSearchInput);
        searchInput.addEventListener("keyup", handleSearchInput);

        searchOptions.addEventListener("click", () => {
            searchInput.value = "";
            dropdown.classList.remove("show");
            searchOptions.classList.add("d-none");
        });

        document.body.addEventListener("click", (e: any) => {
            if (e.target.getAttribute("id") !== "search-options") {
                dropdown.classList.remove("show");
                searchOptions.classList.add("d-none");
            }
        });
    }, [searchTerm]);

    const onKeyDownPress = (e: any) => {
        const { key } = e;
        if (key === "Enter") {
            e.preventDefault();
            setSearchTerm(e.target.value);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setSearchTerm(event.target.value);
    };

    // Filter routes based on search term
    useEffect(() => {
        const filteredMenuItems = navData.reduce((result: any, menuItem: any) => {
            const lowercaseLabel = menuItem.label ? menuItem.label.toLowerCase() : "";
            const lowercaseLink = menuItem.link ? menuItem.link.toLowerCase() : "";

            if (
                lowercaseLabel.includes(searchTerm.toLowerCase()) ||
                lowercaseLink.includes(searchTerm.toLowerCase())
            ) {
                result.push(menuItem);
            }

            const filteredSubItems = (menuItem.subItems || []).filter((subItem: any) => {
                const lowercaseSubItemLabel = subItem.label ? subItem.label.toLowerCase() : "";
                const lowercaseSubItemLink = subItem.link ? subItem.link.toLowerCase() : "";

                return (
                    lowercaseSubItemLabel.includes(searchTerm.toLowerCase()) ||
                    lowercaseSubItemLink.includes(searchTerm.toLowerCase())
                );
            });

            if (filteredSubItems.length > 0) {
                const menuItemWithSubItems = { ...menuItem, subItems: filteredSubItems };
                result.push(menuItemWithSubItems);
            }

            return result;
        }, []);

        setFilterData(filteredMenuItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    return (
        <React.Fragment>
            <form className="app-search d-none d-md-block">
                <div className="position-relative">
                    <Form.Control
                        type="text"
                        className="form-control"
                        placeholder={tr("Search...")}
                        id="search-options"
                        value={searchTerm}
                        onKeyDown={onKeyDownPress}
                        onChange={handleChange}
                    />
                    <span className="mdi mdi-magnify search-widget-icon"></span>
                    <span
                        className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                        id="search-close-options"
                    ></span>
                </div>

                <div className="dropdown-menu dropdown-menu-lg" id="search-dropdown">
                    <SimpleBar style={{ height: "320px" }}>
                        {/* Recent Searches */}
                        <div className="dropdown-header">
                            <h6 className="text-overflow text-muted mb-0 text-uppercase">
                                {tr("Recent Searches")}
                            </h6>
                        </div>

                        {/* <div className="dropdown-item bg-transparent text-wrap">
                            <Link href="/" className="btn btn-soft-secondary btn-sm rounded-pill">
                                how to setup <i className="mdi mdi-magnify ms-1"></i>
                            </Link>
                            <Link href="/" className="btn btn-soft-secondary btn-sm rounded-pill">
                                buttons <i className="mdi mdi-magnify ms-1"></i>
                            </Link>
                        </div> */}

                        {/* Filtered Menu Items */}
                        {filterData.map((menuItem: any, index: any) => (
                            <React.Fragment key={index}>
                                {!menuItem.subItems ? (
                                    <Link href={menuItem.link} className="dropdown-item notify-item">
                                        <i
                                            className={
                                                menuItem.icon +
                                                " align-middle fs-xl text-muted me-2"
                                            }
                                        ></i>
                                        <span>{menuItem.label}</span>
                                    </Link>
                                ) : (
                                    <div className="dropdown-header mt-2">
                                        <h6 className="text-overflow text-muted mb-1 text-uppercase">
                                            {menuItem.label}
                                        </h6>
                                    </div>
                                )}

                                {menuItem.subItems && menuItem.subItems.length > 0 && (
                                    <>
                                        {menuItem.subItems.map(
                                            (subItem: any, subIndex: number) => (
                                                <Link
                                                    key={subIndex}
                                                    href={subItem.link}
                                                    className="dropdown-item notify-item"
                                                >
                                                    <i
                                                        className={
                                                            menuItem.icon +
                                                            " align-middle fs-xl text-muted me-2"
                                                        }
                                                    ></i>
                                                    <span>{subItem.label}</span>
                                                </Link>
                                            )
                                        )}
                                    </>
                                )}
                            </React.Fragment>
                        ))}

                    </SimpleBar>

            
                </div>
            </form>
        </React.Fragment>
    );
};

export default SearchOption;