import React, { useEffect, useMemo } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "../../../../Layouts";

const createTranslator = (translations: Record<string, any>) => {
    return (
        key: string,
        replacements: Record<string, string | number> = {},
    ) => {
        let text = translations?.[key] ?? key;
        Object.entries(replacements).forEach(([name, value]) => {
            text = text.replace(`:${name}`, String(value));
        });
        return text;
    };
};

interface Props {
    type: string;
    typeConfig: {
        translation_key: string;
        is_custom?: boolean;
    };
    item?: {
        id?: number;
        value?: Record<string, string>;
        type?: Record<string, string>;
    } | null;
}

const CategoryForm = ({ type, typeConfig, item = null }: Props) => {
    const page = usePage().props as any;
    const { auth, translations = {}, languages = [], locale } = page;

    const currentLocale = locale || "gu";
    const tr = useMemo(() => createTranslator(translations), [translations]);

    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, "-")
        : "admin";

    const isEdit = !!item?.id;
    const isCustom = !!typeConfig.is_custom;

    // Prefill type from ?custom_type=Kirtan%20Type when creating
    const urlCustomType =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("custom_type") ||
              ""
            : "";

    // Lock type ONLY when creating a custom category with a pre-filled urlCustomType
    // const isTypeLocked = isCustom && !isEdit && !!urlCustomType;
    const isTypeLocked = isCustom && !!urlCustomType;

    const initialValue = useMemo(() => {
        return languages.reduce((values: any, language: any) => {
            values[language.code] = item?.value?.[language.code] ?? "";
            return values;
        }, {});
    }, [languages, item]);

    const initialType = useMemo(() => {
        if (!isCustom) return {};

        return languages.reduce((values: any, language: any) => {
            if (item?.type?.[language.code]) {
                // edit: keep saved type
                values[language.code] = item.type[language.code];
            } else if (urlCustomType && language.code === currentLocale) {
                // create from filtered type → same type for all locales
                values[language.code] = urlCustomType;
            } else {
                values[language.code] = "";
            }
            return values;
        }, {});
    }, [languages, item, isCustom, urlCustomType, currentLocale]);

    const { data, setData, post, put, processing, errors } = useForm({
        value: initialValue,
        type: initialType,
        locale: currentLocale,
        custom_type: urlCustomType || "",
    });

    useEffect(() => {
        setData("locale", currentLocale);
    }, [currentLocale]);

    const setValue = (text: string) => {
        setData("value", { ...data.value, [currentLocale]: text });
    };

    const setTypeValue = (text: string) => {
        if (isTypeLocked) return;
        setData("type", { ...data.type, [currentLocale]: text });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route("role.category.update", {
                    rolePrefix,
                    type,
                    category: item!.id,
                }),
            );
        } else {
            post(route("role.category.store", { rolePrefix, type }));
        }
    };

    // const customTypeLabel =
    //     data.type?.[currentLocale] ||
    //     urlCustomType ||
    //     tr(typeConfig.translation_key);

    const customTypeLabel = (() => {
        // Prefer the value from the URL when present (matches the navbar section language)
        if (isCustom && urlCustomType) {
            return urlCustomType;
        }

        // Otherwise use the type stored for the current locale
        if (data.type?.[currentLocale]) {
            return data.type[currentLocale];
        }

        // Fallback: any non-empty type from the item
        if (item?.type) {
            for (const code of Object.keys(item.type)) {
                const v = item.type[code];
                if (typeof v === "string" && v.trim() !== "") {
                    return v;
                }
            }
        }

        return tr(typeConfig.translation_key);
    })();

    // "Add Kirtan Type" / "Edit Kirtan Type" style
    const pageTitle = isCustom
        ? isEdit
            ? `${tr("edit") || "Edit"} ${customTypeLabel}`
            : `${tr("add") || "Add"} ${customTypeLabel}`
        : isEdit
          ? tr(`edit_${type}`) || tr("edit")
          : tr(`add_${type}`) || tr("add");

    const nameLabel = isCustom
        ? tr("value_custom") || tr("value") || tr("name")
        : tr(`${type}_name`) || tr("name");

    const namePlaceholder = isCustom
        ? tr("value_placeholder") || tr("name_placeholder")
        : tr(`${type}_name_placeholder`) || tr("name_placeholder");

    const typeHelp = isCustom
        ? isTypeLocked
            ? tr("custom_type_locked_help") ||
              "Type is fixed and cannot be changed."
            : tr("type")
        : tr(`${type}_type_help`) || tr("type");

    const cancelHref =
        isCustom && (urlCustomType || data.type?.[currentLocale])
            ? route("role.category.list", { rolePrefix, type }) +
              `?custom_type=${encodeURIComponent(
                  urlCustomType || data.type[currentLocale],
              )}`
            : route("role.category.list", { rolePrefix, type });

    return (
        <React.Fragment>
            <Head title={pageTitle} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title={pageTitle}
                        pageTitle={
                            isCustom
                                ? customTypeLabel
                                : tr(typeConfig.translation_key)
                        }
                    />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Header>
                                    <h5 className="card-title mb-0">
                                        {isEdit
                                            ? isCustom
                                                ? `${customTypeLabel} ${tr("details") || ""}`.trim()
                                                : tr(`${type}_details`) ||
                                                  tr("details")
                                            : isCustom
                                              ? `${tr("new") || "New"} ${customTypeLabel}`
                                              : tr(`new_${type}`) || tr("new")}
                                    </h5>
                                </Card.Header>

                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        {/* Type field */}
                                        {isCustom ? (
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    {tr("type")}{" "}
                                                    {!isTypeLocked && (
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    )}
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={
                                                        isTypeLocked &&
                                                        urlCustomType
                                                            ? urlCustomType
                                                            : (data.type?.[
                                                                  currentLocale
                                                              ] ?? "")
                                                    }
                                                    onChange={(e) =>
                                                        setTypeValue(
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={isTypeLocked}
                                                    readOnly={isTypeLocked}
                                                    isInvalid={
                                                        !!errors[
                                                            `type.${currentLocale}`
                                                        ] || !!errors.type
                                                    }
                                                    placeholder={
                                                        isTypeLocked
                                                            ? undefined
                                                            : tr(
                                                                  "type_placeholder",
                                                              )
                                                    }
                                                />
                                                {isTypeLocked && (
                                                    <Form.Text className="text-muted">
                                                        {typeHelp}
                                                    </Form.Text>
                                                )}
                                                <Form.Control.Feedback type="invalid">
                                                    {tr(
                                                        errors[
                                                            `type.${currentLocale}`
                                                        ] ||
                                                            errors.type ||
                                                            "",
                                                    )}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        ) : (
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    {tr("type")}
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={tr(
                                                        typeConfig.translation_key,
                                                    )}
                                                    disabled
                                                    readOnly
                                                />
                                                <Form.Text className="text-muted">
                                                    {typeHelp}
                                                </Form.Text>
                                            </Form.Group>
                                        )}

                                        {/* Value */}
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="category-value">
                                                {nameLabel}{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                id="category-value"
                                                placeholder={namePlaceholder}
                                                value={
                                                    data.value?.[
                                                        currentLocale
                                                    ] ?? ""
                                                }
                                                onChange={(e) =>
                                                    setValue(e.target.value)
                                                }
                                                isInvalid={
                                                    !!errors[
                                                        `value.${currentLocale}`
                                                    ] || !!errors.value
                                                }
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {tr(
                                                    errors[
                                                        `value.${currentLocale}`
                                                    ] ||
                                                        errors.value ||
                                                        "",
                                                )}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        {/* All languages reference */}
                                        <div className="mb-3 p-2 rounded border bg-light">
                                            <small className="text-muted d-block mb-1">
                                                {tr("both_languages_reference")}
                                            </small>
                                            <div
                                                className="d-flex flex-wrap gap-3"
                                                style={{ fontSize: "13px" }}
                                            >
                                                {languages.map(
                                                    (language: any) => (
                                                        <span
                                                            key={language.code}
                                                        >
                                                            <strong>
                                                                {language.code.toUpperCase()}
                                                                :
                                                            </strong>{" "}
                                                            {isCustom &&
                                                                (data.type?.[
                                                                    language
                                                                        .code
                                                                ]
                                                                    ? `${data.type[language.code]} / `
                                                                    : "")}
                                                            {data.value?.[
                                                                language.code
                                                            ] || "—"}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <Link
                                                href={cancelHref}
                                                className="btn btn-secondary me-2"
                                            >
                                                {tr("cancel")}
                                            </Link>
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? tr("saving")
                                                    : isEdit
                                                      ? tr("update")
                                                      : tr("save")}
                                            </button>
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
};

CategoryForm.layout = (page: any) => <Layout children={page} />;
export default CategoryForm;
