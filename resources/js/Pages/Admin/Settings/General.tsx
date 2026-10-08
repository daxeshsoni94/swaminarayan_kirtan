import React, { useEffect, useMemo, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import InputError from "../../../Components/InputError";
import defaultLogo from "../../../../images/logo-light.png";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import Layout from "../../../Layouts";

const createTranslator = (translations: Record<string, any>) => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ): string => {
        let text = translations[key] ?? key;

        Object.entries(replacements).forEach(([name, value]) => {
            text = String(text).replace(
                new RegExp(`:${name}`, "g"),
                String(value),
            );
        });

        return text;
    };
};

export default function GeneralSettings() {
    const page = usePage().props as any;

    const { settings = {}, locale, translations = {}, languages = [] } = page;

    const currentLocale = locale || "gu";
    const tr = useMemo(() => createTranslator(translations), [translations]);

    const [preview, setPreview] = useState(
        settings.app_logo ? `/storage/${settings.app_logo}` : defaultLogo,
    );

    // ── Dynamic multilingual initial values (same pattern as NameForm) ─────
    const initialAppName = useMemo(() => {
        return languages.reduce(
            (values: Record<string, string>, language: any) => {
                values[language.code] =
                    settings.app_name?.[language.code] ?? "";
                return values;
            },
            {},
        );
    }, [languages, settings.app_name]);

    const initialAddress = useMemo(() => {
        return languages.reduce(
            (values: Record<string, string>, language: any) => {
                values[language.code] = settings.address?.[language.code] ?? "";
                return values;
            },
            {},
        );
    }, [languages, settings.address]);

    const { data, setData, post, errors, processing } = useForm({
        app_name: initialAppName,
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        address: initialAddress,
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

    // Update only the current locale
    const setTranslation = (field: "app_name" | "address", text: string) => {
        setData(field, {
            ...data[field],
            [currentLocale]: text,
        });
    };

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

        post(route("role.settings.update", { rolePrefix: page.rolePrefix }), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    // Current language object (for label)
    const currentLanguage = languages.find(
        (l: any) => l.code === currentLocale,
    );

    return (
        <React.Fragment>
            <Head title={tr("general_settings") || "General Settings"} />
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col lg={12}>
                            <h4 className="mb-3">{tr("general_settings")}</h4>

                            <Card>
                                <Card.Body>
                                    <p className="text-muted mb-4">
                                        {tr("general_settings_description")}
                                    </p>

                                    <Form onSubmit={submit}>
                                        <Row>
                                            {/* App Name - only current language */}
                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {tr("app_name")}
                                                    {currentLanguage
                                                        ? ` (${currentLanguage.name})`
                                                        : ""}
                                                </Form.Label>

                                                <Form.Control
                                                    type="text"
                                                    value={
                                                        data.app_name?.[
                                                            currentLocale
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setTranslation(
                                                            "app_name",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />

                                                <InputError
                                                    message={
                                                        errors[
                                                            `app_name.${currentLocale}`
                                                        ]
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* App Logo */}
                                            <Col lg={12} className="mb-4">
                                                <Form.Label>
                                                    {tr("app_logo")}
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
                                                            alt={tr("app_logo")}
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
                                                            {tr(
                                                                "app_logo_recommended",
                                                            )}
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
                                                    {tr("contact_email")}
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
                                                    {tr("contact_phone")}
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

                                            {/* Address - only current language */}
                                            <Col lg={12} className="mb-3">
                                                <Form.Label>
                                                    {tr("address")}
                                                    {currentLanguage
                                                        ? ` (${currentLanguage.name})`
                                                        : ""}
                                                </Form.Label>

                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={
                                                        data.address?.[
                                                            currentLocale
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setTranslation(
                                                            "address",
                                                            e.target.value,
                                                        )
                                                    }
                                                />

                                                <InputError
                                                    message={
                                                        errors[
                                                            `address.${currentLocale}`
                                                        ]
                                                    }
                                                    className="mt-2"
                                                />
                                            </Col>

                                            {/* All languages reference (optional but useful) */}
                                            <Col lg={12} className="mb-3">
                                                <div className="p-2 rounded border bg-light">
                                                    <small className="text-muted d-block mb-1">
                                                        {tr(
                                                            "both_languages_reference",
                                                        )}
                                                    </small>
                                                    <div
                                                        className="d-flex flex-wrap gap-3"
                                                        style={{
                                                            fontSize: "13px",
                                                        }}
                                                    >
                                                        {languages.map(
                                                            (language: any) => (
                                                                <span
                                                                    key={
                                                                        language.code
                                                                    }
                                                                >
                                                                    <strong>
                                                                        {language.code.toUpperCase()}
                                                                        :
                                                                    </strong>{" "}
                                                                    {data
                                                                        .app_name?.[
                                                                        language
                                                                            .code
                                                                    ] || "—"}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </Col>

                                            {/* SMTP Settings */}
                                            <Col lg={12}>
                                                <hr className="my-4" />
                                                <h5 className="mb-3">
                                                    {tr("smtp_settings")}
                                                </h5>
                                            </Col>

                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {tr("mail_mailer")}
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

                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {tr("mail_host")}
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

                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {tr("mail_port")}
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

                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {tr("mail_username")}
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

                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {tr("mail_password")}
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

                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {tr("mail_encryption")}
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
                                                        {tr("none")}
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

                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {tr("mail_from_address")}
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

                                            <Col lg={6} className="mb-3">
                                                <Form.Label>
                                                    {tr("mail_from_name")}
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
                                                    {tr("social_links")}
                                                </h5>
                                            </Col>

                                            <Col lg={4} className="mb-3">
                                                <Form.Label>
                                                    {tr("facebook_url")}
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
                                                    {tr("instagram_url")}
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
                                                    {tr("youtube_url")}
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
                                                        {tr("saving")}
                                                    </>
                                                ) : (
                                                    tr("save_changes")
                                                )}
                                            </Button>
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
