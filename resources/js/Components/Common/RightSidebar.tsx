import React, { useEffect, useState, useCallback } from "react";
import { Offcanvas, Collapse, Form } from "react-bootstrap";
import { router, usePage } from "@inertiajs/react";
import { usePermission } from "../../hooks/usePermission";

//redux
import {
    changeLayout,
    changeSidebarTheme,
    changeLayoutMode,
    changeLayoutWidth,
    changeLayoutPosition,
    changeTopbarTheme,
    changeLeftsidebarSizeType,
    changeLeftsidebarViewType,
    changeSidebarImageType,
    changePreLoader,
    changeSidebarVisibility,
} from "../../slices/thunk";

import { useSelector, useDispatch } from "react-redux";

//import Constant
import {
    LAYOUT_TYPES,
    LAYOUT_SIDEBAR_TYPES,
    LAYOUT_MODE_TYPES,
    LAYOUT_WIDTH_TYPES,
    LAYOUT_POSITION_TYPES,
    LAYOUT_TOPBAR_THEME_TYPES,
    LEFT_SIDEBAR_SIZE_TYPES,
    LEFT_SIDEBAR_VIEW_TYPES,
    LEFT_SIDEBAR_IMAGE_TYPES,
    PERLOADER_TYPES,
    SIDEBAR_VISIBILITY_TYPES,
} from "../constants/layout";

//SimpleBar
import SimpleBar from "simplebar-react";
import classnames from "classnames";
import { createSelector } from "reselect";

const RightSidebar = (props: any) => {
    const dispatch: any = useDispatch();

    // ── Get current user role + translations ──────────────────────
    const { auth, translations = {} } = usePage().props as any;

    // Helper – works for any language automatically
    const t = (key: string) => translations?.[key] || key;

    const { can } = usePermission();
    
    // If user doesn't have settings view permission, don't show the customizer
    if (!can("settings", "view")) {
        return null;
    }

    const [show, setShow] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);

    // ── Redux state ───────────────────────────────────────────────
    const selectRightsidebarState = (state: any) => state.Layout;
    const selectRightsidebarProperties = createSelector(
        selectRightsidebarState,
        (layout: any) => ({
            layoutType: layout.layoutType,
            leftSidebarType: layout.leftSidebarType,
            layoutModeType: layout.layoutModeType,
            layoutWidthType: layout.layoutWidthType,
            layoutPositionType: layout.layoutPositionType,
            topbarThemeType: layout.topbarThemeType,
            leftsidbarSizeType: layout.leftsidbarSizeType,
            leftSidebarViewType: layout.leftSidebarViewType,
            leftSidebarImageType: layout.leftSidebarImageType,
            preloader: layout.preloader,
            sidebarVisibilitytype: layout.sidebarVisibilitytype,
        }),
    );

    const {
        layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        leftSidebarImageType,
        preloader,
        sidebarVisibilitytype,
    } = useSelector((state: any) => selectRightsidebarProperties(state));

    // ── Save layout to database ───────────────────────────────────
    // We send the FULL current state so the backend always has a complete snapshot
    const saveLayout = useCallback(
        (overrides: Record<string, any> = {}) => {
            const width =
                overrides.layoutWidthType ?? layoutWidthType ?? "fluid";

            const safeWidth = ["fluid", "boxed"].includes(width)
                ? width
                : "fluid";
            router.post(
                route("settings.layout.update"),
                {
                    layoutType:
                        overrides.layoutType ?? layoutType ?? "vertical",
                    layoutModeType:
                        overrides.layoutModeType ?? layoutModeType ?? "light",
                    layoutWidthType: safeWidth, // ← forced correct value
                    layoutPositionType:
                        overrides.layoutPositionType ??
                        layoutPositionType ??
                        "fixed",
                    topbarThemeType:
                        overrides.topbarThemeType ?? topbarThemeType ?? "light",
                    leftsidbarSizeType:
                        overrides.leftsidbarSizeType ??
                        leftsidbarSizeType ??
                        "lg",
                    leftSidebarViewType:
                        overrides.leftSidebarViewType ??
                        leftSidebarViewType ??
                        "default",
                    leftSidebarType:
                        overrides.leftSidebarType ?? leftSidebarType ?? "dark",
                    leftSidebarImageType:
                        overrides.leftSidebarImageType ??
                        leftSidebarImageType ??
                        "none",
                    sidebarVisibilitytype:
                        overrides.sidebarVisibilitytype ??
                        sidebarVisibilitytype ??
                        "show",
                    preloader: overrides.preloader ?? preloader ?? "disable",
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    // optional: silent success (no toast if you don't want it)
                    // onSuccess: () => {},
                },
            );
        },
        [
            layoutType,
            layoutModeType,
            layoutWidthType,
            layoutPositionType,
            topbarThemeType,
            leftsidbarSizeType,
            leftSidebarViewType,
            leftSidebarType,
            leftSidebarImageType,
            sidebarVisibilitytype,
            preloader,
        ],
    );

    // ── Helpers for radio changes ─────────────────────────────────
    const handleLayoutChange = (value: string) => {
        dispatch(changeLayout(value));
        saveLayout({ layoutType: value });
    };

    const handleLayoutModeChange = (value: string) => {
        dispatch(changeLayoutMode(value));
        saveLayout({ layoutModeType: value });
    };

    const handleLayoutWidthChange = (value: string) => {
        dispatch(changeLayoutWidth(value));
        // also change sidebar size as original code did
        const size = value === "boxed" ? "sm-hover" : "lg";
        dispatch(changeLeftsidebarSizeType(size));
        saveLayout({ layoutWidthType: value, leftsidbarSizeType: size });
    };

    const handleLayoutPositionChange = (value: string) => {
        dispatch(changeLayoutPosition(value));
        saveLayout({ layoutPositionType: value });
    };

    const handleTopbarThemeChange = (value: string) => {
        dispatch(changeTopbarTheme(value));
        saveLayout({ topbarThemeType: value });
    };

    const handleSidebarSizeChange = (value: string) => {
        dispatch(changeLeftsidebarSizeType(value));
        saveLayout({ leftsidbarSizeType: value });
    };

    const handleSidebarViewChange = (value: string) => {
        dispatch(changeLeftsidebarViewType(value));
        saveLayout({ leftSidebarViewType: value });
    };

    const handleSidebarThemeChange = (value: string) => {
        setShow(false);
        dispatch(changeSidebarTheme(value));
        saveLayout({ leftSidebarType: value });
    };

    const handleSidebarImageChange = (value: string) => {
        dispatch(changeSidebarImageType(value));
        saveLayout({ leftSidebarImageType: value });
    };

    const handleSidebarVisibilityChange = (value: string) => {
        dispatch(changeSidebarVisibility(value));
        saveLayout({ sidebarVisibilitytype: value });
    };

    const handleCustomImageUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            router.post(
                route("settings.layout.update"),
                {
                    layoutType: layoutType ?? "vertical",
                    layoutModeType: layoutModeType ?? "light",
                    layoutWidthType: layoutWidthType ?? "fluid",
                    layoutPositionType: layoutPositionType ?? "fixed",
                    topbarThemeType: topbarThemeType ?? "light",
                    leftsidbarSizeType: leftsidbarSizeType ?? "lg",
                    leftSidebarViewType: leftSidebarViewType ?? "default",
                    leftSidebarType: leftSidebarType ?? "dark",
                    sidebarVisibilitytype: sidebarVisibilitytype ?? "show",
                    preloader: preloader ?? "disable",
                    leftSidebarImageType: LEFT_SIDEBAR_IMAGE_TYPES.CUSTOM,
                    custom_sidebar_image_file: file,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        dispatch(changeSidebarImageType(LEFT_SIDEBAR_IMAGE_TYPES.CUSTOM));
                    },
                }
            );
        }
    };

    const handlePreloaderChange = (value: string) => {
        dispatch(changePreLoader(value));
        saveLayout({ preloader: value });
    };

    function tog_show() {
        setShow(!show);
        dispatch(changeSidebarTheme("gradient"));
        // optional: also save gradient when opening the panel
        saveLayout({ leftSidebarType: "gradient" });
    }

    useEffect(() => {
        const sidebarColorDark = document.getElementById(
            "sidebar-color-dark",
        ) as HTMLInputElement;
        const sidebarColorLight = document.getElementById(
            "sidebar-color-light",
        ) as HTMLInputElement;

        if (show && sidebarColorDark && sidebarColorLight) {
            sidebarColorDark.checked = false;
            sidebarColorLight.checked = false;
        }
    }, [show]);

    const toggleLeftCanvas = () => {
        setOpen(!open);
    };

    // back-to-top
    window.onscroll = function () {
        scrollFunction();
    };

    const scrollFunction = () => {
        const element = document.getElementById("back-to-top");
        if (element) {
            if (
                document.body.scrollTop > 100 ||
                document.documentElement.scrollTop > 100
            ) {
                element.style.display = "block";
            } else {
                element.style.display = "none";
            }
        }
    };

    const toTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    const pathName = window.location.pathname;

    useEffect(() => {
        const preloaderEl = document.getElementById("preloader") as HTMLElement;
        if (preloaderEl) {
            preloaderEl.style.opacity = "1";
            preloaderEl.style.visibility = "visible";
            setTimeout(function () {
                preloaderEl.style.opacity = "0";
                preloaderEl.style.visibility = "hidden";
            }, 1000);
        }
    }, [pathName, preloader]);

    return (
        <React.Fragment>
            <button
                onClick={() => toTop()}
                className="btn btn-danger btn-icon"
                id="back-to-top"
            >
                <i className="ri-arrow-up-line"></i>
            </button>

            {preloader === "enable" && (
                <div id="preloader">
                    <div id="status">
                        <div
                            className="spinner-border text-primary avatar-sm"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <div className="customizer-setting d-none d-md-block">
                    <div
                        onClick={toggleLeftCanvas}
                        className="btn-info rounded-pill shadow-lg btn btn-icon btn-lg p-2 rounded-pill"
                    >
                        <i className="mdi mdi-spin mdi-cog-outline fs-22"></i>
                    </div>
                </div>

                <Offcanvas
                    show={open}
                    onHide={toggleLeftCanvas}
                    placement="end"
                    className="offcanvas-end border-0"
                >
                    <Offcanvas.Header
                        className="d-flex align-items-center bg-primary bg-gradient p-3 offcanvas-header-dark"
                        closeButton
                    >
                        <span className="m-0 me-2 text-white">
                            {t("Theme Customizer")}
                        </span>
                    </Offcanvas.Header>

                    <Offcanvas.Body className="p-0">
                        <SimpleBar className="h-100">
                            <div className="p-4">
                                {/* ── Layout ─────────────────────────────── */}
                                <h6 className="mb-0 fw-semibold text-uppercase">
                                    {t("Layout")}
                                </h6>
                                <p className="text-muted">
                                    {t("Choose your layout")}
                                </p>

                                <div className="row gy-3">
                                    {/* Vertical */}
                                    <div className="col-4">
                                        <div className="form-check card-radio">
                                            <input
                                                id="customizer-layout01"
                                                name="data-layout"
                                                type="radio"
                                                value={LAYOUT_TYPES.VERTICAL}
                                                checked={
                                                    layoutType ===
                                                    LAYOUT_TYPES.VERTICAL
                                                }
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleLayoutChange(
                                                            e.target.value,
                                                        );
                                                    }
                                                }}
                                                className="form-check-input"
                                            />
                                            <Form.Check.Label
                                                className="form-check-label p-0 avatar-md w-100"
                                                htmlFor="customizer-layout01"
                                            >
                                                <span className="d-flex gap-1 h-100">
                                                    <span className="flex-shrink-0">
                                                        <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                        </span>
                                                    </span>
                                                    <span className="flex-grow-1">
                                                        <span className="d-flex h-100 flex-column">
                                                            <span className="bg-light d-block p-1"></span>
                                                            <span className="bg-light d-block p-1 mt-auto"></span>
                                                        </span>
                                                    </span>
                                                </span>
                                            </Form.Check.Label>
                                        </div>
                                        <h5 className="fs-13 text-center mt-2">
                                            {t("Vertical")}
                                        </h5>
                                    </div>

                                    {/* Horizontal */}
                                    <div className="col-4">
                                        <div className="form-check card-radio">
                                            <input
                                                id="customizer-layout02"
                                                name="data-layout"
                                                type="radio"
                                                value={LAYOUT_TYPES.HORIZONTAL}
                                                checked={
                                                    layoutType ===
                                                    LAYOUT_TYPES.HORIZONTAL
                                                }
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleLayoutChange(
                                                            e.target.value,
                                                        );
                                                    }
                                                }}
                                                className="form-check-input"
                                            />
                                            <Form.Check.Label
                                                className="form-check-label p-0 avatar-md w-100"
                                                htmlFor="customizer-layout02"
                                            >
                                                <span className="d-flex h-100 flex-column gap-1">
                                                    <span className="bg-light d-flex p-1 gap-1 align-items-center">
                                                        <span className="d-block p-1 bg-primary-subtle rounded me-1"></span>
                                                        <span className="d-block p-1 pb-0 px-2 bg-primary-subtle ms-auto"></span>
                                                        <span className="d-block p-1 pb-0 px-2 bg-primary-subtle"></span>
                                                    </span>
                                                    <span className="bg-light d-block p-1"></span>
                                                    <span className="bg-light d-block p-1 mt-auto"></span>
                                                </span>
                                            </Form.Check.Label>
                                        </div>
                                        <h5 className="fs-13 text-center mt-2">
                                            {t("Horizontal")}
                                        </h5>
                                    </div>

                                    {/* Two Column */}
                                    <div className="col-4">
                                        <div className="form-check card-radio">
                                            <input
                                                id="customizer-layout03"
                                                name="data-layout"
                                                type="radio"
                                                value={LAYOUT_TYPES.TWOCOLUMN}
                                                checked={
                                                    layoutType ===
                                                    LAYOUT_TYPES.TWOCOLUMN
                                                }
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleLayoutChange(
                                                            e.target.value,
                                                        );
                                                    }
                                                }}
                                                className="form-check-input"
                                            />
                                            <Form.Check.Label
                                                className="form-check-label p-0 avatar-md w-100"
                                                htmlFor="customizer-layout03"
                                            >
                                                <span className="d-flex gap-1 h-100">
                                                    <span className="flex-shrink-0">
                                                        <span className="bg-light d-flex h-100 flex-column gap-1">
                                                            <span className="d-block p-1 bg-primary-subtle mb-2"></span>
                                                            <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                        </span>
                                                    </span>
                                                    <span className="flex-shrink-0">
                                                        <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                        </span>
                                                    </span>
                                                    <span className="flex-grow-1">
                                                        <span className="d-flex h-100 flex-column">
                                                            <span className="bg-light d-block p-1"></span>
                                                            <span className="bg-light d-block p-1 mt-auto"></span>
                                                        </span>
                                                    </span>
                                                </span>
                                            </Form.Check.Label>
                                        </div>
                                        <h5 className="fs-13 text-center mt-2">
                                            {t("Two Column")}
                                        </h5>
                                    </div>

                                    {/* Semi Box */}
                                    <div className="col-4">
                                        <div className="form-check card-radio">
                                            <input
                                                id="customizer-layout04"
                                                name="data-layout"
                                                type="radio"
                                                className="form-check-input"
                                                value={LAYOUT_TYPES.SEMIBOX}
                                                checked={
                                                    layoutType ===
                                                    LAYOUT_TYPES.SEMIBOX
                                                }
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleLayoutChange(
                                                            e.target.value,
                                                        );
                                                    }
                                                }}
                                            />
                                            <Form.Check.Label
                                                className="form-check-label p-0 avatar-md w-100"
                                                htmlFor="customizer-layout04"
                                            >
                                                <span className="d-flex gap-1 h-100">
                                                    <span className="flex-shrink-0 p-1">
                                                        <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                        </span>
                                                    </span>
                                                    <span className="flex-grow-1">
                                                        <span className="d-flex h-100 flex-column pt-1 pe-2">
                                                            <span className="bg-light d-block p-1"></span>
                                                            <span className="bg-light d-block p-1 mt-auto"></span>
                                                        </span>
                                                    </span>
                                                </span>
                                            </Form.Check.Label>
                                        </div>
                                        <h5 className="fs-13 text-center mt-2">
                                            {t("Semi Box")}
                                        </h5>
                                    </div>
                                </div>

                                {/* ── Color Scheme ───────────────────────── */}
                                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                    {t("Color Scheme")}
                                </h6>
                                <p className="text-muted">
                                    {t("Choose Light or Dark Scheme.")}
                                </p>

                                <div className="colorscheme-cardradio">
                                    <div className="row">
                                        <div className="col-4">
                                            <div className="form-check card-radio">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="data-bs-theme"
                                                    id="layout-mode-light"
                                                    value={
                                                        LAYOUT_MODE_TYPES.LIGHTMODE
                                                    }
                                                    checked={
                                                        layoutModeType ===
                                                        LAYOUT_MODE_TYPES.LIGHTMODE
                                                    }
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            handleLayoutModeChange(
                                                                e.target.value,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Form.Check.Label
                                                    className="form-check-label p-0 avatar-md w-100"
                                                    htmlFor="layout-mode-light"
                                                >
                                                    <span className="d-flex gap-1 h-100">
                                                        <span className="flex-shrink-0">
                                                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            </span>
                                                        </span>
                                                        <span className="flex-grow-1">
                                                            <span className="d-flex h-100 flex-column">
                                                                <span className="bg-light d-block p-1"></span>
                                                                <span className="bg-light d-block p-1 mt-auto"></span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                </Form.Check.Label>
                                            </div>
                                            <h5 className="fs-13 text-center mt-2">
                                                {t("Light")}
                                            </h5>
                                        </div>

                                        <div className="col-4">
                                            <div className="form-check card-radio dark">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="data-bs-theme"
                                                    id="layout-mode-dark"
                                                    value={
                                                        LAYOUT_MODE_TYPES.DARKMODE
                                                    }
                                                    checked={
                                                        layoutModeType ===
                                                        LAYOUT_MODE_TYPES.DARKMODE
                                                    }
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            handleLayoutModeChange(
                                                                e.target.value,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Form.Check.Label
                                                    className="form-check-label p-0 avatar-md w-100 bg-dark"
                                                    htmlFor="layout-mode-dark"
                                                >
                                                    <span className="d-flex gap-1 h-100">
                                                        <span className="flex-shrink-0">
                                                            <span className="bg-white bg-opacity-10 d-flex h-100 flex-column gap-1 p-1">
                                                                <span className="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                                            </span>
                                                        </span>
                                                        <span className="flex-grow-1">
                                                            <span className="d-flex h-100 flex-column">
                                                                <span className="bg-white bg-opacity-10 d-block p-1"></span>
                                                                <span className="bg-white bg-opacity-10 d-block p-1 mt-auto"></span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                </Form.Check.Label>
                                            </div>
                                            <h5 className="fs-13 text-center mt-2">
                                                {t("Dark")}
                                            </h5>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Sidebar Visibility (only for Semi Box) */}
                                {layoutType === LAYOUT_TYPES.SEMIBOX && (
                                    <div id="sidebar-visibility">
                                        <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                            {t("Sidebar Visibility")}
                                        </h6>
                                        <p className="text-muted">
                                            {t(
                                                "Choose show or Hidden sidebar.",
                                            )}
                                        </p>

                                        <div className="row">
                                            <div className="col-4">
                                                <div className="form-check card-radio">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="data-sidebar-visibility"
                                                        id="sidebar-visibility-show"
                                                        value={
                                                            SIDEBAR_VISIBILITY_TYPES.SHOW
                                                        }
                                                        checked={
                                                            sidebarVisibilitytype ===
                                                            SIDEBAR_VISIBILITY_TYPES.SHOW
                                                        }
                                                        onChange={(e) => {
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                handleSidebarVisibilityChange(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Form.Check.Label
                                                        className="form-check-label p-0 avatar-md w-100"
                                                        htmlFor="sidebar-visibility-show"
                                                    >
                                                        {/* visual remains the same */}
                                                        <span className="d-flex gap-1 h-100">
                                                            <span className="flex-shrink-0 p-1">
                                                                <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                    <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                </span>
                                                            </span>
                                                            <span className="flex-grow-1">
                                                                <span className="d-flex h-100 flex-column pt-1 pe-2">
                                                                    <span className="bg-light d-block p-1"></span>
                                                                    <span className="bg-light d-block p-1 mt-auto"></span>
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </Form.Check.Label>
                                                </div>
                                                <h5 className="fs-13 text-center mt-2">
                                                    {t("Show")}
                                                </h5>
                                            </div>
                                            <div className="col-4">
                                                <div className="form-check card-radio">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="data-sidebar-visibility"
                                                        id="sidebar-visibility-hidden"
                                                        value={
                                                            SIDEBAR_VISIBILITY_TYPES.HIDDEN
                                                        }
                                                        checked={
                                                            sidebarVisibilitytype ===
                                                            SIDEBAR_VISIBILITY_TYPES.HIDDEN
                                                        }
                                                        onChange={(e) => {
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                handleSidebarVisibilityChange(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Form.Check.Label
                                                        className="form-check-label p-0 avatar-md w-100 px-2"
                                                        htmlFor="sidebar-visibility-hidden"
                                                    >
                                                        <span className="d-flex gap-1 h-100">
                                                            <span className="flex-grow-1">
                                                                <span className="d-flex h-100 flex-column pt-1 px-2">
                                                                    <span className="bg-light d-block p-1"></span>
                                                                    <span className="bg-light d-block p-1 mt-auto"></span>
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </Form.Check.Label>
                                                </div>
                                                <h5 className="fs-13 text-center mt-2">
                                                    {t("Hidden")}
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Layout Width + Position ────────────── */}
                                {layoutType !== LAYOUT_TYPES.TWOCOLUMN && (
                                    <React.Fragment>
                                        {(layoutType ===
                                            LAYOUT_TYPES.VERTICAL ||
                                            layoutType ===
                                                LAYOUT_TYPES.HORIZONTAL) && (
                                            <div id="layout-width">
                                                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                                    {t("Layout Width")}
                                                </h6>
                                                <p className="text-muted">
                                                    {t(
                                                        "Choose Fluid or Boxed layout.",
                                                    )}
                                                </p>

                                                <div className="row">
                                                    <div className="col-4">
                                                        <div className="form-check card-radio">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="data-layout-width"
                                                                id="layout-width-fluid"
                                                                value={
                                                                    LAYOUT_WIDTH_TYPES.FLUID
                                                                }
                                                                checked={
                                                                    layoutWidthType ===
                                                                    LAYOUT_WIDTH_TYPES.FLUID
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        e.target
                                                                            .checked
                                                                    ) {
                                                                        handleLayoutWidthChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <Form.Check.Label
                                                                className="form-check-label p-0 avatar-md w-100"
                                                                htmlFor="layout-width-fluid"
                                                            >
                                                                {/* visual remains */}
                                                                <span className="d-flex gap-1 h-100">
                                                                    <span className="flex-shrink-0">
                                                                        <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                        </span>
                                                                    </span>
                                                                    <span className="flex-grow-1">
                                                                        <span className="d-flex h-100 flex-column">
                                                                            <span className="bg-light d-block p-1"></span>
                                                                            <span className="bg-light d-block p-1 mt-auto"></span>
                                                                        </span>
                                                                    </span>
                                                                </span>
                                                            </Form.Check.Label>
                                                        </div>
                                                        <h5 className="fs-13 text-center mt-2">
                                                            {t("Fluid")}
                                                        </h5>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="form-check card-radio">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="data-layout-width"
                                                                id="layout-width-boxed"
                                                                value={
                                                                    LAYOUT_WIDTH_TYPES.BOXED
                                                                }
                                                                checked={
                                                                    layoutWidthType ===
                                                                    LAYOUT_WIDTH_TYPES.BOXED
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        e.target
                                                                            .checked
                                                                    ) {
                                                                        handleLayoutWidthChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <Form.Check.Label
                                                                className="form-check-label p-0 avatar-md w-100 px-2"
                                                                htmlFor="layout-width-boxed"
                                                            >
                                                                <span className="d-flex gap-1 h-100 border-start border-end">
                                                                    <span className="flex-shrink-0">
                                                                        <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                        </span>
                                                                    </span>
                                                                    <span className="flex-grow-1">
                                                                        <span className="d-flex h-100 flex-column">
                                                                            <span className="bg-light d-block p-1"></span>
                                                                            <span className="bg-light d-block p-1 mt-auto"></span>
                                                                        </span>
                                                                    </span>
                                                                </span>
                                                            </Form.Check.Label>
                                                        </div>
                                                        <h5 className="fs-13 text-center mt-2">
                                                            {t("Boxed")}
                                                        </h5>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div id="layout-position">
                                            <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                                {t("Layout Position")}
                                            </h6>
                                            <p className="text-muted">
                                                {t(
                                                    "Choose Fixed or Scrollable Layout Position.",
                                                )}
                                            </p>

                                            <div
                                                className="btn-group radio"
                                                role="group"
                                            >
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="data-layout-position"
                                                    id="layout-position-fixed"
                                                    value={
                                                        LAYOUT_POSITION_TYPES.FIXED
                                                    }
                                                    checked={
                                                        layoutPositionType ===
                                                        LAYOUT_POSITION_TYPES.FIXED
                                                    }
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            handleLayoutPositionChange(
                                                                e.target.value,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Form.Check.Label
                                                    className="btn btn-light w-sm"
                                                    htmlFor="layout-position-fixed"
                                                >
                                                    {t("Fixed")}
                                                </Form.Check.Label>

                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="data-layout-position"
                                                    id="layout-position-scrollable"
                                                    value={
                                                        LAYOUT_POSITION_TYPES.SCROLLABLE
                                                    }
                                                    checked={
                                                        layoutPositionType ===
                                                        LAYOUT_POSITION_TYPES.SCROLLABLE
                                                    }
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            handleLayoutPositionChange(
                                                                e.target.value,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Form.Check.Label
                                                    className="btn btn-light w-sm ms-0"
                                                    htmlFor="layout-position-scrollable"
                                                >
                                                    {t("Scrollable")}
                                                </Form.Check.Label>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                )}

                                {/* ── Topbar Color ───────────────────────── */}
                                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                    {t("Topbar Color")}
                                </h6>
                                <p className="text-muted">
                                    {t("Choose Light or Dark Topbar Color.")}
                                </p>

                                <div className="row">
                                    <div className="col-4">
                                        <div className="form-check card-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="data-topbar"
                                                id="topbar-color-light"
                                                value={
                                                    LAYOUT_TOPBAR_THEME_TYPES.LIGHT
                                                }
                                                checked={
                                                    topbarThemeType ===
                                                    LAYOUT_TOPBAR_THEME_TYPES.LIGHT
                                                }
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleTopbarThemeChange(
                                                            e.target.value,
                                                        );
                                                    }
                                                }}
                                            />
                                            <Form.Check.Label
                                                className="form-check-label p-0 avatar-md w-100"
                                                htmlFor="topbar-color-light"
                                            >
                                                {/* visual remains */}
                                                <span className="d-flex gap-1 h-100">
                                                    <span className="flex-shrink-0">
                                                        <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                        </span>
                                                    </span>
                                                    <span className="flex-grow-1">
                                                        <span className="d-flex h-100 flex-column">
                                                            <span className="bg-light d-block p-1"></span>
                                                            <span className="bg-light d-block p-1 mt-auto"></span>
                                                        </span>
                                                    </span>
                                                </span>
                                            </Form.Check.Label>
                                        </div>
                                        <h5 className="fs-13 text-center mt-2">
                                            {t("Light")}
                                        </h5>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-check card-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="data-topbar"
                                                id="topbar-color-dark"
                                                value={
                                                    LAYOUT_TOPBAR_THEME_TYPES.DARK
                                                }
                                                checked={
                                                    topbarThemeType ===
                                                    LAYOUT_TOPBAR_THEME_TYPES.DARK
                                                }
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleTopbarThemeChange(
                                                            e.target.value,
                                                        );
                                                    }
                                                }}
                                            />
                                            <Form.Check.Label
                                                className="form-check-label p-0 avatar-md w-100"
                                                htmlFor="topbar-color-dark"
                                            >
                                                <span className="d-flex gap-1 h-100">
                                                    <span className="flex-shrink-0">
                                                        <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                        </span>
                                                    </span>
                                                    <span className="flex-grow-1">
                                                        <span className="d-flex h-100 flex-column">
                                                            <span className="bg-primary d-block p-1"></span>
                                                            <span className="bg-light d-block p-1 mt-auto"></span>
                                                        </span>
                                                    </span>
                                                </span>
                                            </Form.Check.Label>
                                        </div>
                                        <h5 className="fs-13 text-center mt-2">
                                            {t("Dark")}
                                        </h5>
                                    </div>
                                </div>

                                {/* ── Sidebar Size + View ────────────────── */}
                                {(layoutType === "vertical" ||
                                    (layoutType === "semibox" &&
                                        sidebarVisibilitytype === "show")) && (
                                    <React.Fragment>
                                        <div id="sidebar-size">
                                            <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                                {t("Sidebar Size")}
                                            </h6>
                                            <p className="text-muted">
                                                {t("Choose a size of Sidebar.")}
                                            </p>

                                            <div className="row">
                                                {/* Default */}
                                                <div className="col-4">
                                                    <div className="form-check sidebar-setting card-radio">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="data-sidebar-size"
                                                            id="sidebar-size-default"
                                                            value={
                                                                LEFT_SIDEBAR_SIZE_TYPES.DEFAULT
                                                            }
                                                            checked={
                                                                leftsidbarSizeType ===
                                                                LEFT_SIDEBAR_SIZE_TYPES.DEFAULT
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    handleSidebarSizeChange(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Form.Check.Label
                                                            className="form-check-label p-0 avatar-md w-100"
                                                            htmlFor="sidebar-size-default"
                                                        >
                                                            {/* visual remains */}
                                                            <span className="d-flex gap-1 h-100">
                                                                <span className="flex-shrink-0">
                                                                    <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                        <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                                        <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                    </span>
                                                                </span>
                                                                <span className="flex-grow-1">
                                                                    <span className="d-flex h-100 flex-column">
                                                                        <span className="bg-light d-block p-1"></span>
                                                                        <span className="bg-light d-block p-1 mt-auto"></span>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </Form.Check.Label>
                                                    </div>
                                                    <h5 className="fs-13 text-center mt-2">
                                                        {t("Default")}
                                                    </h5>
                                                </div>

                                                {/* Compact */}
                                                <div className="col-4">
                                                    <div className="form-check sidebar-setting card-radio">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="data-sidebar-size"
                                                            id="sidebar-size-compact"
                                                            value={
                                                                LEFT_SIDEBAR_SIZE_TYPES.COMPACT
                                                            }
                                                            checked={
                                                                leftsidbarSizeType ===
                                                                LEFT_SIDEBAR_SIZE_TYPES.COMPACT
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    handleSidebarSizeChange(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Form.Check.Label
                                                            className="form-check-label p-0 avatar-md w-100"
                                                            htmlFor="sidebar-size-compact"
                                                        >
                                                            <span className="d-flex gap-1 h-100">
                                                                <span className="flex-shrink-0">
                                                                    <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                        <span className="d-block p-1 bg-primary-subtle rounded mb-2"></span>
                                                                        <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                                    </span>
                                                                </span>
                                                                <span className="flex-grow-1">
                                                                    <span className="d-flex h-100 flex-column">
                                                                        <span className="bg-light d-block p-1"></span>
                                                                        <span className="bg-light d-block p-1 mt-auto"></span>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </Form.Check.Label>
                                                    </div>
                                                    <h5 className="fs-13 text-center mt-2">
                                                        {t("Compact")}
                                                    </h5>
                                                </div>

                                                {/* Small (Icon View) */}
                                                <div className="col-4">
                                                    <div className="form-check sidebar-setting card-radio">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="data-sidebar-size"
                                                            id="sidebar-size-small"
                                                            value={
                                                                LEFT_SIDEBAR_SIZE_TYPES.SMALLICON
                                                            }
                                                            checked={
                                                                leftsidbarSizeType ===
                                                                LEFT_SIDEBAR_SIZE_TYPES.SMALLICON
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    handleSidebarSizeChange(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Form.Check.Label
                                                            className="form-check-label p-0 avatar-md w-100"
                                                            htmlFor="sidebar-size-small"
                                                        >
                                                            <span className="d-flex gap-1 h-100">
                                                                <span className="flex-shrink-0">
                                                                    <span className="bg-light d-flex h-100 flex-column gap-1">
                                                                        <span className="d-block p-1 bg-primary-subtle mb-2"></span>
                                                                        <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                                    </span>
                                                                </span>
                                                                <span className="flex-grow-1">
                                                                    <span className="d-flex h-100 flex-column">
                                                                        <span className="bg-light d-block p-1"></span>
                                                                        <span className="bg-light d-block p-1 mt-auto"></span>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </Form.Check.Label>
                                                    </div>
                                                    <h5 className="fs-13 text-center mt-2">
                                                        {t("Small (Icon View)")}
                                                    </h5>
                                                </div>

                                                {/* Small Hover View */}
                                                <div className="col-4">
                                                    <div className="form-check sidebar-setting card-radio">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="data-sidebar-size"
                                                            id="sidebar-size-small-hover"
                                                            value={
                                                                LEFT_SIDEBAR_SIZE_TYPES.SMALLHOVER
                                                            }
                                                            checked={
                                                                leftsidbarSizeType ===
                                                                LEFT_SIDEBAR_SIZE_TYPES.SMALLHOVER
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    handleSidebarSizeChange(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Form.Check.Label
                                                            className="form-check-label p-0 avatar-md w-100"
                                                            htmlFor="sidebar-size-small-hover"
                                                        >
                                                            <span className="d-flex gap-1 h-100">
                                                                <span className="flex-shrink-0">
                                                                    <span className="bg-light d-flex h-100 flex-column gap-1">
                                                                        <span className="d-block p-1 bg-primary-subtle mb-2"></span>
                                                                        <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                                                    </span>
                                                                </span>
                                                                <span className="flex-grow-1">
                                                                    <span className="d-flex h-100 flex-column">
                                                                        <span className="bg-light d-block p-1"></span>
                                                                        <span className="bg-light d-block p-1 mt-auto"></span>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </Form.Check.Label>
                                                    </div>
                                                    <h5 className="fs-13 text-center mt-2">
                                                        {t("Small Hover View")}
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>

                                        {layoutType !== "semibox" && (
                                            <div id="sidebar-view">
                                                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                                    {t("Sidebar View")}
                                                </h6>
                                                <p className="text-muted">
                                                    {t(
                                                        "Choose Default or Detached Sidebar view.",
                                                    )}
                                                </p>

                                                <div className="row">
                                                    <div className="col-4">
                                                        <div className="form-check sidebar-setting card-radio">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="data-layout-style"
                                                                id="sidebar-view-default"
                                                                value={
                                                                    LEFT_SIDEBAR_VIEW_TYPES.DEFAULT
                                                                }
                                                                checked={
                                                                    leftSidebarViewType ===
                                                                    LEFT_SIDEBAR_VIEW_TYPES.DEFAULT
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        e.target
                                                                            .checked
                                                                    ) {
                                                                        handleSidebarViewChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <Form.Check.Label
                                                                className="form-check-label p-0 avatar-md w-100"
                                                                htmlFor="sidebar-view-default"
                                                            >
                                                                {/* visual remains */}
                                                                <span className="d-flex gap-1 h-100">
                                                                    <span className="flex-shrink-0">
                                                                        <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                        </span>
                                                                    </span>
                                                                    <span className="flex-grow-1">
                                                                        <span className="d-flex h-100 flex-column">
                                                                            <span className="bg-light d-block p-1"></span>
                                                                            <span className="bg-light d-block p-1 mt-auto"></span>
                                                                        </span>
                                                                    </span>
                                                                </span>
                                                            </Form.Check.Label>
                                                        </div>
                                                        <h5 className="fs-13 text-center mt-2">
                                                            {t("Default")}
                                                        </h5>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="form-check sidebar-setting card-radio">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="data-layout-style"
                                                                id="sidebar-view-detached"
                                                                value={
                                                                    LEFT_SIDEBAR_VIEW_TYPES.DETACHED
                                                                }
                                                                checked={
                                                                    leftSidebarViewType ===
                                                                    LEFT_SIDEBAR_VIEW_TYPES.DETACHED
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        e.target
                                                                            .checked
                                                                    ) {
                                                                        handleSidebarViewChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <Form.Check.Label
                                                                className="form-check-label p-0 avatar-md w-100"
                                                                htmlFor="sidebar-view-detached"
                                                            >
                                                                {/* visual remains */}
                                                                <span className="d-flex h-100 flex-column">
                                                                    <span className="bg-light d-flex p-1 gap-1 align-items-center px-2">
                                                                        <span className="d-block p-1 bg-primary-subtle rounded me-1"></span>
                                                                        <span className="d-block p-1 pb-0 px-2 bg-primary-subtle ms-auto"></span>
                                                                        <span className="d-block p-1 pb-0 px-2 bg-primary-subtle"></span>
                                                                    </span>
                                                                    <span className="d-flex gap-1 h-100 p-1 px-2">
                                                                        <span className="flex-shrink-0">
                                                                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                            </span>
                                                                        </span>
                                                                    </span>
                                                                    <span className="bg-light d-block p-1 mt-auto px-2"></span>
                                                                </span>
                                                            </Form.Check.Label>
                                                        </div>
                                                        <h5 className="fs-13 text-center mt-2">
                                                            {t("Detached")}
                                                        </h5>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}

                                {/* ── Sidebar Color + Images ─────────────── */}
                                {(layoutType === "vertical" ||
                                    layoutType === "twocolumn" ||
                                    (layoutType === "semibox" &&
                                        sidebarVisibilitytype === "show")) && (
                                    <React.Fragment>
                                        <div id="sidebar-color">
                                            <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                                {t("Sidebar Color")}
                                            </h6>
                                            <p className="text-muted">
                                                {t(
                                                    "Choose Light or Dark Sidebar Color.",
                                                )}
                                            </p>

                                            <div className="row">
                                                <div className="col-4">
                                                    <div className="form-check sidebar-setting card-radio">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="data-sidebar"
                                                            id="sidebar-color-light"
                                                            value={
                                                                LAYOUT_SIDEBAR_TYPES.LIGHT
                                                            }
                                                            checked={
                                                                leftSidebarType ===
                                                                LAYOUT_SIDEBAR_TYPES.LIGHT
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    handleSidebarThemeChange(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Form.Check.Label
                                                            className="form-check-label p-0 avatar-md w-100"
                                                            htmlFor="sidebar-color-light"
                                                        >
                                                            {/* visual remains */}
                                                            <span className="d-flex gap-1 h-100">
                                                                <span className="flex-shrink-0">
                                                                    <span className="bg-white border-end d-flex h-100 flex-column gap-1 p-1">
                                                                        <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                                        <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                        <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                    </span>
                                                                </span>
                                                                <span className="flex-grow-1">
                                                                    <span className="d-flex h-100 flex-column">
                                                                        <span className="bg-light d-block p-1"></span>
                                                                        <span className="bg-light d-block p-1 mt-auto"></span>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </Form.Check.Label>
                                                    </div>
                                                    <h5 className="fs-13 text-center mt-2">
                                                        {t("Light")}
                                                    </h5>
                                                </div>
                                                <div className="col-4">
                                                    <div className="form-check sidebar-setting card-radio">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="data-sidebar"
                                                            id="sidebar-color-dark"
                                                            value={
                                                                LAYOUT_SIDEBAR_TYPES.DARK
                                                            }
                                                            checked={
                                                                leftSidebarType ===
                                                                LAYOUT_SIDEBAR_TYPES.DARK
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    handleSidebarThemeChange(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Form.Check.Label
                                                            className="form-check-label p-0 avatar-md w-100"
                                                            htmlFor="sidebar-color-dark"
                                                        >
                                                            <span className="d-flex gap-1 h-100">
                                                                <span className="flex-shrink-0">
                                                                    <span className="bg-primary d-flex h-100 flex-column gap-1 p-1">
                                                                        <span className="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2"></span>
                                                                        <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                                                        <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                                                        <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                                                    </span>
                                                                </span>
                                                                <span className="flex-grow-1">
                                                                    <span className="d-flex h-100 flex-column">
                                                                        <span className="bg-light d-block p-1"></span>
                                                                        <span className="bg-light d-block p-1 mt-auto"></span>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </Form.Check.Label>
                                                    </div>
                                                    <h5 className="fs-13 text-center mt-2">
                                                        {t("Dark")}
                                                    </h5>
                                                </div>

                                                <div className="col-4">
                                                    <button
                                                        className={classnames(
                                                            "btn btn-link avatar-md w-100 p-0 overflow-hidden border ",
                                                            {
                                                                collapsed:
                                                                    !show,
                                                                active:
                                                                    show ===
                                                                    true,
                                                            },
                                                        )}
                                                        type="button"
                                                        data-bs-target="#collapseBgGradient"
                                                        data-bs-toggle="collapse"
                                                        aria-controls="collapseBgGradient"
                                                        onClick={tog_show}
                                                    >
                                                        <span className="d-flex gap-1 h-100">
                                                            <span className="flex-shrink-0">
                                                                <span className="bg-vertical-gradient d-flex h-100 flex-column gap-1 p-1">
                                                                    <span className="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2"></span>
                                                                    <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                                                    <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                                                    <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                                                </span>
                                                            </span>
                                                            <span className="flex-grow-1">
                                                                <span className="d-flex h-100 flex-column">
                                                                    <span className="bg-light d-block p-1"></span>
                                                                    <span className="bg-light d-block p-1 mt-auto"></span>
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </button>
                                                    <h5 className="fs-13 text-center mt-2">
                                                        {t("Gradient")}
                                                    </h5>
                                                </div>
                                            </div>

                                            <Collapse
                                                in={show}
                                                className="collapse"
                                            >
                                                <div id="collapseBgGradient">
                                                    <div className="d-flex gap-2 flex-wrap img-switch p-2 px-3 bg-light rounded">
                                                        {[
                                                            LAYOUT_SIDEBAR_TYPES.GRADIENT,
                                                            LAYOUT_SIDEBAR_TYPES.GRADIENT_2,
                                                            LAYOUT_SIDEBAR_TYPES.GRADIENT_3,
                                                            LAYOUT_SIDEBAR_TYPES.GRADIENT_4,
                                                        ].map((grad, idx) => (
                                                            <div
                                                                key={grad}
                                                                className="form-check sidebar-setting card-radio"
                                                            >
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="data-sidebar"
                                                                    id={`sidebar-color-gradient${idx === 0 ? "" : `-${idx + 1}`}`}
                                                                    value={grad}
                                                                    checked={
                                                                        leftSidebarType ===
                                                                        grad
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        if (
                                                                            e
                                                                                .target
                                                                                .checked
                                                                        ) {
                                                                            handleSidebarThemeChange(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                                <Form.Check.Label
                                                                    className="form-check-label p-0 avatar-xs rounded-circle"
                                                                    htmlFor={`sidebar-color-gradient${idx === 0 ? "" : `-${idx + 1}`}`}
                                                                >
                                                                    <span
                                                                        className={`avatar-title rounded-circle bg-vertical-gradient${idx === 0 ? "" : `-${idx + 1}`}`}
                                                                    ></span>
                                                                </Form.Check.Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Collapse>
                                        </div>

                                        <div id="sidebar-img">
                                            <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                                {t("Sidebar Images")}
                                            </h6>
                                            <p className="text-muted">
                                                {t(
                                                    "Choose a image of Sidebar.",
                                                )}
                                            </p>

                                            <div className="d-flex gap-2 flex-wrap img-switch">
                                                {/* None */}
                                                <div className="form-check sidebar-setting card-radio">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="data-sidebar-image"
                                                        id="sidebarimg-none"
                                                        value={
                                                            LEFT_SIDEBAR_IMAGE_TYPES.NONE
                                                        }
                                                        checked={
                                                            leftSidebarImageType ===
                                                            LEFT_SIDEBAR_IMAGE_TYPES.NONE
                                                        }
                                                        onChange={(e) => {
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                handleSidebarImageChange(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Form.Check.Label
                                                        className="form-check-label p-0 avatar-sm h-auto"
                                                        htmlFor="sidebarimg-none"
                                                    >
                                                        <span className="avatar-md w-auto bg-light d-flex align-items-center justify-content-center">
                                                            <i className="ri-close-fill fs-20"></i>
                                                        </span>
                                                    </Form.Check.Label>
                                                </div>

                                                {/* Image options – you can keep the commented img tags if needed */}
                                                {[
                                                    LEFT_SIDEBAR_IMAGE_TYPES.IMG1,
                                                    LEFT_SIDEBAR_IMAGE_TYPES.IMG2,
                                                    LEFT_SIDEBAR_IMAGE_TYPES.IMG3,
                                                    LEFT_SIDEBAR_IMAGE_TYPES.IMG4,
                                                ].map((img, idx) => (
                                                    <div
                                                        key={img}
                                                        className="form-check sidebar-setting card-radio"
                                                    >
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="data-sidebar-image"
                                                            id={`sidebarimg-0${idx + 1}`}
                                                            value={img}
                                                            checked={
                                                                leftSidebarImageType ===
                                                                img
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    handleSidebarImageChange(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        {/* <Form.Check.Label
                                                            className="form-check-label p-0 avatar-sm h-auto"
                                                            htmlFor={`sidebarimg-0${idx + 1}`}
                                                        >
                                                            <span className="avatar-md w-auto bg-light d-flex align-items-center justify-content-center">
                                                                Image {idx + 1}
                                                            </span>
                                                        </Form.Check.Label> */}
                                                    </div>
                                                ))}
                                                <div className="col-12 mt-2">
                                                    <div className="form-check sidebar-setting">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="data-sidebar-image"
                                                            id="sidebarimg-custom"
                                                            value={LEFT_SIDEBAR_IMAGE_TYPES.CUSTOM}
                                                            checked={leftSidebarImageType === LEFT_SIDEBAR_IMAGE_TYPES.CUSTOM}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    handleSidebarImageChange(e.target.value);
                                                                }
                                                            }}
                                                        />
                                                        <label className="form-check-label d-block" htmlFor="sidebarimg-custom">
                                                            Custom Image
                                                        </label>
                                                        <input
                                                            type="file"
                                                            className="form-control form-control-sm mt-1"
                                                            accept="image/*"
                                                            onChange={handleCustomImageUpload}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                )}

                                {/* ── Preloader ──────────────────────────── */}
                                <div id="preloader-menu">
                                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                                        {t("Preloader")}
                                    </h6>
                                    <p className="text-muted">
                                        {t("Choose a preloader.")}
                                    </p>

                                    <div className="row">
                                        <div className="col-4">
                                            <div className="form-check sidebar-setting card-radio">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="data-preloader"
                                                    id="preloader-view-custom"
                                                    value={
                                                        PERLOADER_TYPES.ENABLE
                                                    }
                                                    checked={
                                                        preloader ===
                                                        PERLOADER_TYPES.ENABLE
                                                    }
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            handlePreloaderChange(
                                                                e.target.value,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Form.Check.Label
                                                    className="form-check-label p-0 avatar-md w-100"
                                                    htmlFor="preloader-view-custom"
                                                >
                                                    <span className="d-flex gap-1 h-100">
                                                        <span className="flex-shrink-0">
                                                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            </span>
                                                        </span>
                                                        <span className="flex-grow-1">
                                                            <span className="d-flex h-100 flex-column">
                                                                <span className="bg-light d-block p-1"></span>
                                                                <span className="bg-light d-block p-1 mt-auto"></span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                    <div
                                                        id="status"
                                                        className="d-flex align-items-center justify-content-center"
                                                    >
                                                        <div
                                                            className="spinner-border text-primary avatar-xxs m-auto"
                                                            role="status"
                                                        >
                                                            <span className="visually-hidden">
                                                                Loading...
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Form.Check.Label>
                                            </div>
                                            <h5 className="fs-13 text-center mt-2">
                                                {t("Enable")}
                                            </h5>
                                        </div>
                                        <div className="col-4">
                                            <div className="form-check sidebar-setting card-radio">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="data-preloader"
                                                    id="preloader-view-none"
                                                    value={
                                                        PERLOADER_TYPES.DISABLE
                                                    }
                                                    checked={
                                                        preloader ===
                                                        PERLOADER_TYPES.DISABLE
                                                    }
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            handlePreloaderChange(
                                                                e.target.value,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Form.Check.Label
                                                    className="form-check-label p-0 avatar-md w-100"
                                                    htmlFor="preloader-view-none"
                                                >
                                                    <span className="d-flex gap-1 h-100">
                                                        <span className="flex-shrink-0">
                                                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                                                <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                                            </span>
                                                        </span>
                                                        <span className="flex-grow-1">
                                                            <span className="d-flex h-100 flex-column">
                                                                <span className="bg-light d-block p-1"></span>
                                                                <span className="bg-light d-block p-1 mt-auto"></span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                </Form.Check.Label>
                                            </div>
                                            <h5 className="fs-13 text-center mt-2">
                                                {t("Disable")}
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SimpleBar>
                    </Offcanvas.Body>
                </Offcanvas>
            </div>
        </React.Fragment>
    );
};

export default RightSidebar;
