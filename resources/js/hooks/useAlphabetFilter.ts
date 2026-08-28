import { useState } from "react";
import { router } from "@inertiajs/react";

export function useAlphabetFilter(
    routeName: string,
    extraParams: Record<string, any> = {}
) {
    const [selectedLetter, setSelectedLetter] = useState(
        extraParams.letter ?? ""
    );

    const handleLetterFilter = (letter: string) => {
        setSelectedLetter(letter);

        // Remove query parameters that are not route parameters
        const { letter: currentLetter, ...routeParams } = extraParams;

        router.get(
            route(routeName, routeParams),
            {
                ...extraParams,
                letter: letter || undefined,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            }
        );
    };

    return {
        selectedLetter,
        handleLetterFilter,
    };
}