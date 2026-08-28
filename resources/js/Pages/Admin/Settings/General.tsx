import React, { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import InputError from "../../../Components/InputError";
import defaultLogo from "../../../../images/logo-light.png";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import Layout from "../../../Layouts";

export default function GeneralSettings() {
    const { settings, locale, flash } = usePage().props as any;

    const t = {
        en: {
            title: "General Settings",
            description: "Manage your application general settings.",
            appName: "App Name",
            appNameEn: "App Name (English)",
            appNameGu: "App Name (Gujarati)",
            appLogo: "App Logo",
            recommended: "Recommended: PNG, JPG or WEBP. Max 2MB.",
            contactEmail: "Contact Email",
            contactPhone: "Contact Phone",
            address: "Address",
            addressEn: "Address (English)",
            addressGu: "Address (Gujarati)",
            smtpSettings: "SMTP Settings",
            mailMailer: "Mail Mailer",
            mailHost: "SMTP Host",
            mailPort: "SMTP Port",
            mailUsername: "SMTP Username",
            mailPassword: "SMTP Password",
            mailEncryption: "SMTP Encryption",
            mailFromAddress: "From Email Address",
            mailFromName: "From Name",
            socialLinks: "Social Links",
            facebook: "Facebook URL",
            instagram: "Instagram URL",
            youtube: "YouTube URL",
            save: "Save Changes",
            saving: "Saving...",
            updated: "Settings updated successfully.",
        },
        gu: {
            title: "સામાન્ય સેટિંગ્સ",
            description: "તમારી એપ્લિકેશનની સામાન્ય સેટિંગ્સ મેનેજ કરો.",
            appName: "એપનું નામ",
            appNameEn: "એપનું નામ (અંગ્રેજી)",
            appNameGu: "એપનું નામ (ગુજરાતી)",
            appLogo: "એપ લોગો",
            recommended: "ભલામણ: PNG, JPG અથવા WEBP. મહત્તમ 2MB.",
            contactEmail: "કોન્ટેક્ટ ઇમેઇલ",
            contactPhone: "કોન્ટેક્ટ ફોન",
            address: "સરનામું",
            addressEn: "સરનામું (અંગ્રેજી)",
            addressGu: "સરનામું (ગુજરાતી)",
            smtpSettings: "SMTP સેટિંગ્સ",
            mailMailer: "મેઇલ મેઇલર",
            mailHost: "SMTP હોસ્ટ",
            mailPort: "SMTP પોર્ટ",
            mailUsername: "SMTP યુઝરનેમ",
            mailPassword: "SMTP પાસવર્ડ",
            mailEncryption: "SMTP એન્ક્રિપ્શન",
            mailFromAddress: "From ઇમેઇલ સરનામું",
            mailFromName: "From નામ",
            socialLinks: "સોશિયલ લિંક્સ",
            facebook: "ફેસબુક URL",
            instagram: "ઇન્સ્ટાગ્રામ URL",
            youtube: "યુટ્યુબ URL",
            save: "ફેરફારો સાચવો",
            saving: "સાચવી રહ્યા છીએ...",
            updated: "સેટિંગ્સ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે.",
        },
    }[locale === "gu" ? "gu" : "en"];

    const [preview, setPreview] = useState(
        settings.app_logo ? `/storage/${settings.app_logo}` : defaultLogo,
    );

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            app_name: {
                en: settings.app_name?.en || "",
                gu: settings.app_name?.gu || "",
            },
            contact_email: settings.contact_email || "",
            contact_phone: settings.contact_phone || "",
            address: {
                en: settings.address?.en || "",
                gu: settings.address?.gu || "",
            },

            mail_mailer: settings.mail_mailer || "smtp",
            mail_host: settings.mail_host || "",
            mail_port: settings.mail_port || "587",
            mail_username: settings.mail_username || "",
            mail_password: settings.mail_password || "",
            mail_encryption: settings.mail_encryption || "tls",
            mail_from_address: settings.mail_from_address || "",
            mail_from_name: settings.mail_from_name || "",
            facebook_url: settings.facebook_url || "",
            instagram_url: settings.instagram_url || "",
            youtube_url: settings.youtube_url || "",
            app_logo: null as File | null,
        });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setData("app_logo", file);

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setPreview(event.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin.settings.update"), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col lg={12}>
                            <h4 className="mb-3">{t.title}</h4>

                            <Card>
                                <Card.Body>
                                    <p className="text-muted mb-4">
                                        {t.description}
                                    </p>

                                    <Form onSubmit={submit}>
                                        <Row>
                                            {/* App Name EN */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.appNameEn}
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.app_name.en}
                                                    onChange={(e) =>
                                                        setData("app_name", {
                                                            ...data.app_name,
                                                            en: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors["app_name.en"]
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* App Name GU */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.appNameGu}
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.app_name.gu}
                                                    onChange={(e) =>
                                                        setData("app_name", {
                                                            ...data.app_name,
                                                            gu: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors["app_name.gu"]
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* App Logo */}
                                            <Col lg={12} className="mb-4">
                                                <Form.Label>
                                                    {t.appLogo}
                                                </Form.Label>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="border rounded bg-light d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: 90,
                                                            height: 65,
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt="Logo"
                                                            style={{
                                                                maxWidth: 75,
                                                                maxHeight: 50,
                                                                objectFit:
                                                                    "contain",
                                                            }}
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    defaultLogo;
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Form.Control
                                                            type="file"
                                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                                            onChange={
                                                                handleLogoChange
                                                            }
                                                        />
                                                        <small className="text-muted d-block mt-2">
                                                            {t.recommended}
                                                        </small>
                                                        <InputError
                                                            message={
                                                                errors.app_logo
                                                            }
                                                            className="mt-2"
                                                        />
                                                    </div>
                                                </div>
                                            </Col>

                                            {/* Contact Email */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.contactEmail}
                                                </Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={data.contact_email}
                                                    onChange={(e) =>
                                                        setData(
                                                            "contact_email",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors.contact_email
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* Contact Phone */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.contactPhone}
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.contact_phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            "contact_phone",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors.contact_phone
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* Address EN */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.addressEn}
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={data.address.en}
                                                    onChange={(e) =>
                                                        setData("address", {
                                                            ...data.address,
                                                            en: e.target.value,
                                                        })
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors["address.en"]
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* Address GU */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.addressGu}
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={data.address.gu}
                                                    onChange={(e) =>
                                                        setData("address", {
                                                            ...data.address,
                                                            gu: e.target.value,
                                                        })
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors["address.gu"]
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* SMTP Settings */}
                                            <Col lg={12}>
                                                <hr className="my-4" />

                                                <h5 className="mb-3">
                                                    {t.smtpSettings}
                                                </h5>
                                            </Col>

                                            {/* Mail Mailer */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.mailMailer}
                                                </Form.Label>

                                                <Form.Control
                                                    type="text"
                                                    value={data.mail_mailer}
                                                    onChange={(e) =>
                                                        setData(
                                                            "mail_mailer",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="smtp"
                                                />

                                                <InputError
                                                    message={errors.mail_mailer}
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* SMTP Host */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.mailHost}
                                                </Form.Label>

                                                <Form.Control
                                                    type="text"
                                                    value={data.mail_host}
                                                    onChange={(e) =>
                                                        setData(
                                                            "mail_host",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="smtp.gmail.com"
                                                />

                                                <InputError
                                                    message={errors.mail_host}
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* SMTP Port */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.mailPort}
                                                </Form.Label>

                                                <Form.Control
                                                    type="number"
                                                    value={data.mail_port}
                                                    onChange={(e) =>
                                                        setData(
                                                            "mail_port",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="587"
                                                />

                                                <InputError
                                                    message={errors.mail_port}
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* SMTP Username */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.mailUsername}
                                                </Form.Label>

                                                <Form.Control
                                                    type="email"
                                                    value={data.mail_username}
                                                    onChange={(e) =>
                                                        setData(
                                                            "mail_username",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="your@gmail.com"
                                                />

                                                <InputError
                                                    message={
                                                        errors.mail_username
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* SMTP Password */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.mailPassword}
                                                </Form.Label>

                                                <Form.Control
                                                    type="password"
                                                    value={data.mail_password}
                                                    onChange={(e) =>
                                                        setData(
                                                            "mail_password",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="App Password"
                                                />

                                                <InputError
                                                    message={
                                                        errors.mail_password
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* Encryption */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.mailEncryption}
                                                </Form.Label>

                                                <Form.Select
                                                    value={data.mail_encryption}
                                                    onChange={(e) =>
                                                        setData(
                                                            "mail_encryption",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        None
                                                    </option>
                                                    <option value="tls">
                                                        TLS
                                                    </option>
                                                    <option value="ssl">
                                                        SSL
                                                    </option>
                                                </Form.Select>

                                                <InputError
                                                    message={
                                                        errors.mail_encryption
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* From Address */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.mailFromAddress}
                                                </Form.Label>

                                                <Form.Control
                                                    type="email"
                                                    value={
                                                        data.mail_from_address
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "mail_from_address",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="xyz123@gmail.com"
                                                />

                                                <InputError
                                                    message={
                                                        errors.mail_from_address
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* From Name */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {t.mailFromName}
                                                </Form.Label>

                                                <Form.Control
                                                    type="text"
                                                    value={data.mail_from_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            "mail_from_name",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="My Application"
                                                />

                                                <InputError
                                                    message={
                                                        errors.mail_from_name
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* Social Links */}
                                            <Col lg={12}>
                                                <hr className="my-4" />
                                                <h5 className="mb-3 mt-2">
                                                    {t.socialLinks}
                                                </h5>
                                            </Col>

                                            <Col lg={4} className="mb-3">
                                                <Form.Label>
                                                    {t.facebook}
                                                </Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    value={data.facebook_url}
                                                    onChange={(e) =>
                                                        setData(
                                                            "facebook_url",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="https://facebook.com/..."
                                                />
                                                <InputError
                                                    message={
                                                        errors.facebook_url
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            <Col lg={4} className="mb-3">
                                                <Form.Label>
                                                    {t.instagram}
                                                </Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    value={data.instagram_url}
                                                    onChange={(e) =>
                                                        setData(
                                                            "instagram_url",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="https://instagram.com/..."
                                                />
                                                <InputError
                                                    message={
                                                        errors.instagram_url
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            <Col lg={4} className="mb-3">
                                                <Form.Label>
                                                    {t.youtube}
                                                </Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    value={data.youtube_url}
                                                    onChange={(e) =>
                                                        setData(
                                                            "youtube_url",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="https://youtube.com/..."
                                                />
                                                <InputError
                                                    message={errors.youtube_url}
                                                    className="mt-2"
                                                />
                                            </Col>
                                        </Row>

                                        <div className="d-flex align-items-center gap-3 mt-4">
                                            <Button
                                                variant="success"
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        {t.saving}
                                                    </>
                                                ) : (
                                                    t.save
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
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

GeneralSettings.layout = (page: any) => <Layout children={page} />;
