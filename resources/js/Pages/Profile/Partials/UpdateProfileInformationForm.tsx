import InputError from "../../../Components/InputError";

import { useForm, usePage } from "@inertiajs/react";

import { Button, Card, Col, Form, Row } from "react-bootstrap";

import React, { useMemo, useState } from "react";

import defaultAvatar from "../../../../images/users/user-dummy-img.jpg";

interface PageProps {
    locale?: string;
    translations?: Record<string, any>;
    auth?: {
        user?: {
            name?: string | Record<string, string> | null;
            email?: string;
            profile?: string | null;
            role?: {
                name?: string | Record<string, string> | null;
            };
        };
    };
}

interface UpdateProfileInformationProps {
    className?: string;
}

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

const createTranslator = (
    translations: Record<string, any>,
): TranslationFunction => {
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

/**
 * Get translated value from a multilingual database field.
 */
const tValue = (
    value: string | Record<string, string> | null | undefined,
    locale: string,
): string => {
    if (value == null) {
        return "";
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);

            if (typeof parsed === "object" && parsed !== null) {
                return (
                    parsed[locale] ??
                    parsed["en"] ??
                    Object.values(parsed)[0] ??
                    ""
                );
            }

            return value;
        } catch {
            return value;
        }
    }

    return value[locale] ?? value["en"] ?? Object.values(value)[0] ?? "";
};

export default function UpdateProfileInformation({
    className = "",
}: UpdateProfileInformationProps) {
    const { auth, locale, translations = {} } = usePage<PageProps>().props;

    const user = auth?.user;

    const currentLocale = locale || "gu";

    const tr = useMemo(() => createTranslator(translations), [translations]);

    const roleName = tValue(user?.role?.name, currentLocale);

    const displayRole = roleName || tr("user");

    const [preview, setPreview] = useState(
        user?.profile ? `/storage/${user.profile}` : defaultAvatar,
    );

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm<{
            name: string;
            email: string;
            logo: File | null;
        }>({
            name: tValue(user?.name, currentLocale),
            email: user?.email || "",
            logo: null,
        });

    /**
     * Logo Change
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

    /**
     * Submit
     */
    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route("profile.update"), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <React.Fragment>
            <Col className={className}>
                {/* Page Title */}
                <h4 className="mb-3">{tr("profile_information")}</h4>

                <Card>
                    <Card.Body>
                        {/* Description */}
                        <p className="text-muted mb-4">
                            {tr("profile_information_description", {
                                role: displayRole.toLowerCase(),
                            })}
                        </p>

                        <Form onSubmit={submit}>
                            <Row>
                                {/* Name */}
                                <Col lg={6} className="mb-3">
                                    <Form.Label htmlFor="name">
                                        {tr("name")}
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
                                        {tr("email")}
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
                                    <Form.Label>
                                        {tr("role_logo", {
                                            role: displayRole,
                                        })}
                                    </Form.Label>

                                    <div className="d-flex align-items-center gap-3">
                                        {/* Logo Preview */}
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
                                                alt={tr("role_logo", {
                                                    role: displayRole,
                                                })}
                                                style={{
                                                    maxWidth: "65px",
                                                    maxHeight: "40px",
                                                    objectFit: "contain",
                                                    borderRadius: "50%",
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        defaultAvatar;
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
                                                {tr("profile_logo_recommended")}
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

                                            {tr("saving")}
                                        </>
                                    ) : (
                                        tr("save_changes")
                                    )}
                                </Button>

                                {recentlySuccessful && (
                                    <span className="text-success">
                                        {tr("profile_updated_successfully")}
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
