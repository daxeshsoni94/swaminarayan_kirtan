import React, { useMemo } from "react";

import Layout from "../../Layouts";

import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

import { Head, usePage } from "@inertiajs/react";

import { Col, Container } from "react-bootstrap";

type PageProps = {
    auth: any;
    mustVerifyEmail?: boolean;
    status?: string;
    locale?: string;
    translations?: Record<string, any>;
};

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
            text = text.replace(
                new RegExp(`:${name}`, "g"),
                String(value),
            );
        });

        return text;
    };
};

export default function Edit({
    auth,
    mustVerifyEmail,
    status,
}: {
    auth: any;
    mustVerifyEmail?: boolean;
    status?: string;
}) {
    const { locale, translations = {} } =
        usePage<PageProps>().props;

    const currentLocale = locale || "gu";

    const tr = useMemo(
        () => createTranslator(translations),
        [translations],
    );

    return (
        <React.Fragment>
            <Layout>
                <Head title={tr("profile")} />

                <div className="page-content">
                    <Container fluid>
                        <Col>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </Col>

                        <Col>
                            <UpdatePasswordForm className="max-w-xl" />
                        </Col>

                        <Col>
                            <DeleteUserForm className="max-w-xl" />
                        </Col>
                    </Container>
                </div>
            </Layout>
        </React.Fragment>
    );
}