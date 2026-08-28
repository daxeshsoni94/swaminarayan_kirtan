//import Scss
import "../scss/themes.scss";

import { createRoot } from "react-dom/client";
import { createInertiaApp, usePage } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./slices";
import { toast, ToastContainer } from "react-toastify";
import { useEffect } from "react";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";
const store = configureStore({ reducer: rootReducer, devTools: true });

function FlashMessages() {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return null;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <Provider store={store}>
                <App {...props} />
                <ToastContainer />
            </Provider>,
        );
    },
    progress: {
        color: "#4B5563",
    },
});
