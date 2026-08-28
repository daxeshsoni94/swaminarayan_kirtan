import React, { useState } from "react";
import { Link, usePage, Head } from "@inertiajs/react";
import { Container, Navbar, Nav, Collapse } from "react-bootstrap";
import LanguageSwitcher from "../../Components/LanguageSwitcher"; // adjust path if needed

interface Props {
    children: React.ReactNode;
    title?: string;
}

const UserLayout: React.FC<Props> = ({ children, title }) => {
    const { locale } = usePage().props as { locale: string };
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // ─── Translations ────────────────────────────────────────────────
    const t: Record<string, { en: string; gu: string }> = {
        Home: { en: "Home", gu: "હોમ" },
        Pads: { en: "Pads", gu: "પદો" },
        Categories: { en: "Categories", gu: "કેટેગરીઝ" },
        About: { en: "About", gu: "અમારા વિશે" },
        Contact: { en: "Contact", gu: "સંપર્ક" },
        "Swaminarayan Kirtan": {
            en: "Swaminarayan Kirtan",
            gu: "સ્વામિનારાયણ કીર્તન",
        },
        "All rights reserved": {
            en: "All rights reserved.",
            gu: "બધા અધિકારો સુરક્ષિત.",
        },
    };

    const tr = (key: string) => t[key]?.[locale as "en" | "gu"] ?? t[key]?.en ?? key;

    const menuItems = [
        { label: tr("Home"), link: "/", icon: "ri-home-line" },
        { label: tr("Pads"), link: "/pads", icon: "ri-music-2-line" },
        { label: tr("Categories"), link: "/categories", icon: "ri-folder-line" },
        { label: tr("About"), link: "/about", icon: "ri-information-line" },
        { label: tr("Contact"), link: "/contact", icon: "ri-mail-line" },
    ];

    const path = window.location.pathname;

    return (
        <>
            <Head
                title={
                    title ||
                    (locale === "gu" ? "સ્વામિનારાયણ કીર્તન" : "Swaminarayan Kirtan")
                }
            />

            <div className="d-flex flex-column min-vh-100">
                {/* ========== HEADER ========== */}
                <header className="bg-white border-bottom sticky-top shadow-sm">
                    <Container>
                        <Navbar expand="lg" className="px-0 py-2">
                            {/* Logo */}
                            <Link
                                href="/"
                                className="navbar-brand fw-bold fs-4 text-primary mb-0"
                            >
                                {tr("Swaminarayan Kirtan")}
                            </Link>

                            {/* Mobile Toggle */}
                            <button
                                className="navbar-toggler border-0 shadow-none"
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <i className={`ri-${isMenuOpen ? "close" : "menu"}-line fs-22`}></i>
                            </button>

                            {/* Menu */}
                            <Collapse in={isMenuOpen} className="navbar-collapse">
                                <div>
                                    <Nav className="ms-auto align-items-lg-center gap-lg-1">
                                        {menuItems.map((item, index) => (
                                            <Nav.Item key={index}>
                                                <Link
                                                    href={item.link}
                                                    className={`nav-link px-3 py-2 rounded ${
                                                        path === item.link
                                                            ? "active text-primary fw-semibold"
                                                            : "text-dark"
                                                    }`}
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <i className={`${item.icon} me-1`}></i>
                                                    {item.label}
                                                </Link>
                                            </Nav.Item>
                                        ))}

                                        {/* Language Switcher */}
                                        <div className="ms-lg-3 mt-2 mt-lg-0">
                                            <LanguageSwitcher />
                                        </div>
                                    </Nav>
                                </div>
                            </Collapse>
                        </Navbar>
                    </Container>
                </header>

                {/* ========== MAIN CONTENT ========== */}
                <main className="flex-grow-1">{children}</main>

                {/* ========== FOOTER ========== */}
                <footer className="bg-dark text-white text-center py-3 mt-auto">
                    <Container>
                        <small>
                            © {new Date().getFullYear()} {tr("Swaminarayan Kirtan")}.{" "}
                            {tr("All rights reserved")}
                        </small>
                    </Container>
                </footer>
            </div>
        </>
    );
};

export default UserLayout;