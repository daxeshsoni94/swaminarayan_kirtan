import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import ApplicationLogo from "../Components/ApplicationLogo";
import { usePage, router } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";

export default function Guest({ children }: any) {
    const { flash, translations = {} } = usePage().props as any;

    useEffect(() => {
        let hasFlash = false;
        if (flash?.success) {
            toast.success(translations[flash.success] ?? flash.success);
            hasFlash = true;
        }
        if (flash?.error) {
            toast.error(translations[flash.error] ?? flash.error);
            hasFlash = true;
        }
        if (flash?.warning) {
            toast.warning(translations[flash.warning] ?? flash.warning);
            hasFlash = true;
        }

        if (hasFlash && typeof window !== "undefined") {
            if (router && router.page && router.page.props) {
                router.page.props.flash = { success: null, error: null, warning: null };
            }
        }
    }, [flash]);
    return (
        <React.Fragment>
            <div className="auth-page-wrapper">
                <div
                    className="auth-one-bg-position auth-one-bg"
                    id="auth-particles22"
                >
                    <div className="bg-overlay"></div>
                    <div className="shape">
                        <ApplicationLogo />
                    </div>
                </div>

                {children}

                <footer className="footer">
                    <div className="container">
                        <Row>
                            <Col lg={12}>
                                <div className="text-center">
                                    <p className="mb-0 text-muted">
                                        &copy; {new Date().getFullYear()}{" "}
                                        KirtanHub. Crafted with{" "}
                                        <i className="mdi mdi-heart text-danger"></i>{" "}
                                        by Webtwine
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </footer>
            </div>
            <ToastContainer closeButton={false} limit={1} autoClose={3000} />
        </React.Fragment>
    );
}
