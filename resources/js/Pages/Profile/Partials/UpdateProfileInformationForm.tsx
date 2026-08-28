import InputError from "../../../Components/InputError";
import { useForm, usePage } from "@inertiajs/react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import React, { useState } from "react";
import defaultLogo from "../../../../images/logo-light.png";

export default function UpdateProfileInformation({ className = "" }: any) {
    const { auth, locale } = usePage().props as any;
    const user = auth.user;

    const isGu = locale === "gu";
    const roleName = user?.role?.name ?? (isGu ? "વપરાશકર્તા" : "User");

    /*
    |--------------------------------------------------------------------------
    | Translations
    |--------------------------------------------------------------------------
    */

    const getName = (name: any, locale: string) => {
        if (!name) {
            return "";
        }

        // Already a normal string
        if (typeof name === "string") {
            try {
                const parsed = JSON.parse(name);

                if (typeof parsed === "object" && parsed !== null) {
                    return parsed[locale] || parsed.en || "";
                }

                return name;
            } catch {
                return name;
            }
        }

        // JSON/object translation
        if (typeof name === "object") {
            return name[locale] || name.en || "";
        }

        return "";
    };

    // Optional role name translations
    const roleLabels: Record<string, { en: string; gu: string }> = {
        Admin: { en: "Admin", gu: "એડમિન" },
        Founder: { en: "Founder", gu: "સ્થાપક" },
        User: { en: "User", gu: "વપરાશકર્તા" },
        Editor: { en: "Editor", gu: "સંપાદક" },
        Manager: { en: "Manager", gu: "મેનેજર" },
    };

    const displayRole =
        roleLabels[roleName]?.[isGu ? "gu" : "en"] ?? roleName;

    const labels = {
        en: {
            profileInformation: "Profile Information",
            description: `Update your account information and ${displayRole.toLowerCase()} logo.`,
            name: "Name",
            email: "Email",
            adminLogo: `${displayRole} Logo`,
            recommended: "Recommended: PNG, JPG or WEBP. Maximum size: 2MB.",
            saveChanges: "Save Changes",
            saving: "Saving...",
            updated: "Profile updated successfully.",
        },

        gu: {
            profileInformation: "પ્રોફાઇલ માહિતી",
            description: `તમારી એકાઉન્ટ માહિતી અને ${displayRole} લોગો અપડેટ કરો.`,
            name: "નામ",
            email: "ઇમેઇલ",
            adminLogo: `${displayRole} લોગો`,
            recommended: "ભલામણ: PNG, JPG અથવા WEBP. મહત્તમ સાઇઝ: 2MB.",
            saveChanges: "ફેરફારો સાચવો",
            saving: "સાચવી રહ્યા છીએ...",
            updated: "પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે.",
        },
    };

    const t = labels[isGu ? "gu" : "en"];

    /*
    |--------------------------------------------------------------------------
    | Logo
    |--------------------------------------------------------------------------
    */

    const [preview, setPreview] = useState(
        user.profile ? `/storage/${user.profile}` : defaultLogo,
    );

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm<{
            name: string;
            email: string;
            logo: File | null;
        }>({
            name: getName(user.name, locale),
            email: user.email || "",
            logo: null,
        });

    /*
    |--------------------------------------------------------------------------
    | Logo Change
    |--------------------------------------------------------------------------
    */

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setData("logo", file);

        const reader = new FileReader();

        reader.onload = (event) => {
            if (event.target?.result) {
                setPreview(event.target.result as string);
            }
        };

        reader.readAsDataURL(file);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route("profile.update"), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <React.Fragment>
            <Col>
                {/* Page Title */}
                <h4 className="mb-3">{t.profileInformation}</h4>

                <Card>
                    <Card.Body>
                        {/* Description */}
                        <p className="text-muted mb-4">{t.description}</p>

                        <Form onSubmit={submit}>
                            <Row>
                                {/* Name */}
                                <Col lg={6} className="mb-3">
                                    <Form.Label htmlFor="name">
                                        {t.name}
                                    </Form.Label>

                                    <Form.Control
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        required
                                        autoFocus
                                        autoComplete="name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </Col>

                                {/* Email */}
                                <Col lg={6} className="mb-3">
                                    <Form.Label htmlFor="email">
                                        {t.email}
                                    </Form.Label>

                                    <Form.Control
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        required
                                        autoComplete="email"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </Col>

                                {/* Role Logo */}
                                <Col lg={12} className="mb-4">
                                    <Form.Label>{t.adminLogo}</Form.Label>

                                    <div className="d-flex align-items-center gap-3">
                                        {/* Small Logo Preview */}
                                        <div
                                            className="border rounded bg-light d-flex align-items-center justify-content-center"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                overflow: "hidden",
                                                borderRadius: "50%",
                                            }}
                                        >
                                            <img
                                                src={preview}
                                                alt={t.adminLogo}
                                                style={{
                                                    maxWidth: "65px",
                                                    maxHeight: "40px",
                                                    objectFit: "contain",
                                                    borderRadius: "50%",
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        defaultLogo;
                                                }}
                                            />
                                        </div>

                                        {/* Upload */}
                                        <div>
                                            <Form.Control
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                                onChange={handleLogoChange}
                                                style={{
                                                    marginTop: "20px",
                                                }}
                                            />

                                            <small className="text-muted d-block mt-2">
                                                {t.recommended}
                                            </small>

                                            <InputError
                                                className="mt-2"
                                                message={errors.logo}
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Actions */}
                            <div className="d-flex align-items-center gap-3 mt-3">
                                <Button
                                    variant="success"
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            />
                                            {t.saving}
                                        </>
                                    ) : (
                                        t.saveChanges
                                    )}
                                </Button>

                                {recentlySuccessful && (
                                    <span className="text-success">
                                        {t.updated}
                                    </span>
                                )}
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
}