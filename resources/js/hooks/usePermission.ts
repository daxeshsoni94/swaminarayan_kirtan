// resources/js/hooks/usePermission.ts
import { usePage } from "@inertiajs/react";

export const usePermission = () => {
    const { auth } = usePage().props as any;

    const can = (module: string, action: string = "view") => {
        if (auth?.role === "Admin") return true;
        return auth?.permissions?.includes(`${module}.${action}`) ?? false;
    };

    return { can, role: auth?.role };
};