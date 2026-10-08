import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

//import Components
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import RightSidebar from "../Components/Common/RightSidebar";

//import actions
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
    changeSidebarVisibility,
    changePreLoader,
} from "../slices/thunk";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

import { usePage } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";

const Layout = ({ children }: any) => {
    const { flash, translations = {}, layoutSettings } = usePage().props as any;
    const [headerClass, setHeaderClass] = useState<any>("");
    const dispatch: any = useDispatch();

    // ── Flash messages ──────────────────────────────────────────────
    useEffect(() => {
        if (flash?.success) {
            toast.success(translations[flash.success] ?? flash.success);
        }
        if (flash?.error) {
            toast.error(translations[flash.error] ?? flash.error);
        }
        if (flash?.warning) {
            toast.warning(translations[flash.warning] ?? flash.warning);
        }
    }, [flash, translations]);

    // ── Apply layout from database (shared via Inertia) ─────────────
    // This runs once on mount so EVERY user sees the layout Admin saved
    useEffect(() => {
        if (!layoutSettings) return;

        dispatch(changeLayout(layoutSettings.layoutType || "vertical"));
        dispatch(changeLayoutMode(layoutSettings.layoutModeType || "light"));
        dispatch(changeLayoutWidth(layoutSettings.layoutWidthType || "fluid"));
        dispatch(
            changeLayoutPosition(layoutSettings.layoutPositionType || "fixed"),
        );
        dispatch(changeTopbarTheme(layoutSettings.topbarThemeType || "light"));
        dispatch(
            changeLeftsidebarSizeType(
                layoutSettings.leftsidbarSizeType || "lg",
            ),
        );
        dispatch(
            changeLeftsidebarViewType(
                layoutSettings.leftSidebarViewType || "default",
            ),
        );
        dispatch(changeSidebarTheme(layoutSettings.leftSidebarType || "dark"));
        dispatch(
            changeSidebarImageType(
                layoutSettings.leftSidebarImageType || "none",
            ),
        );
        dispatch(
            changeSidebarVisibility(
                layoutSettings.sidebarVisibilitytype || "show",
            ),
        );
        dispatch(changePreLoader(layoutSettings.preloader || "disable"));
    }, []); // empty dependency → only on first load

    const selectLayoutState = (state: any) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
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
        sidebarVisibilitytype,
    }: any = useSelector(selectLayoutProperties);

    /*
    layout settings – keep the existing resize / re-dispatch logic
    */
    useEffect(() => {
        if (
            layoutType ||
            leftSidebarType ||
            layoutModeType ||
            layoutWidthType ||
            layoutPositionType ||
            topbarThemeType ||
            leftsidbarSizeType ||
            leftSidebarViewType ||
            leftSidebarImageType ||
            sidebarVisibilitytype
        ) {
            window.dispatchEvent(new Event("resize"));
            dispatch(changeLeftsidebarViewType(leftSidebarViewType));
            dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
            dispatch(changeSidebarTheme(leftSidebarType));
            dispatch(changeLayoutMode(layoutModeType));
            dispatch(changeLayoutWidth(layoutWidthType));
            dispatch(changeLayoutPosition(layoutPositionType));
            dispatch(changeTopbarTheme(topbarThemeType));
            dispatch(changeLayout(layoutType));
            dispatch(changeSidebarImageType(leftSidebarImageType));
            dispatch(changeSidebarVisibility(sidebarVisibilitytype));
        }
    }, [
        layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        leftSidebarImageType,
        sidebarVisibilitytype,
        dispatch,
    ]);

    /*
    call dark/light mode
    */
    const onChangeLayoutMode = (value: any) => {
        if (changeLayoutMode) {
            dispatch(changeLayoutMode(value));
        }
    };

    // class add remove in header
    useEffect(() => {
        window.addEventListener("scroll", scrollNavigation, true);
        return () => {
            window.removeEventListener("scroll", scrollNavigation, true);
        };
    }, []);

    function scrollNavigation() {
        var scrollup = document.documentElement.scrollTop;
        if (scrollup > 50) {
            setHeaderClass("topbar-shadow");
        } else {
            setHeaderClass("");
        }
    }

    useEffect(() => {
        const humberIcon = document.querySelector(
            ".hamburger-icon",
        ) as HTMLElement;
        if (
            sidebarVisibilitytype === "show" ||
            layoutType === "vertical" ||
            layoutType === "twocolumn"
        ) {
            humberIcon?.classList.remove("open");
        } else {
            humberIcon && humberIcon.classList.add("open");
        }
    }, [sidebarVisibilitytype, layoutType]);

    return (
        <React.Fragment>
            <div id="layout-wrapper">
                <Header
                    headerClass={headerClass}
                    layoutModeType={layoutModeType}
                    onChangeLayoutMode={onChangeLayoutMode}
                />
                <Sidebar layoutType={layoutType} />
                <div className="main-content">
                    {children}
                    <Footer />
                </div>
            </div>
            <RightSidebar />
            <ToastContainer closeButton={false} limit={1} autoClose={3000} />
        </React.Fragment>
    );
};

Layout.propTypes = {
    children: PropTypes.object,
};

export default Layout;
