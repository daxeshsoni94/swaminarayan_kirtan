export const GujaratiLocale = {
    weekdays: {
        shorthand: ["રવિ", "સોમ", "મંગળ", "બુધ", "ગુરુ", "શુક્ર", "શનિ"],
        longhand: [
            "રવિવાર",
            "સોમવાર",
            "મંગળવાર",
            "બુધવાર",
            "ગુરુવાર",
            "શુક્રવાર",
            "શનિવાર",
        ],
    },
    months: {
        shorthand: [
            "જાન્યુ",
            "ફેબ્રુ",
            "માર્ચ",
            "એપ્રિલ",
            "મે",
            "જૂન",
            "જુલાઈ",
            "ઓગ",
            "સપ્ટે",
            "ઓક્ટો",
            "નવે",
            "ડિસે",
        ],
        longhand: [
            "જાન્યુઆરી",
            "ફેબ્રુઆરી",
            "માર્ચ",
            "એપ્રિલ",
            "મે",
            "જૂન",
            "જુલાઈ",
            "ઓગસ્ટ",
            "સપ્ટેમ્બર",
            "ઓક્ટોબર",
            "નવેમ્બર",
            "ડિસેમ્બર",
        ],
    },
    firstDayOfWeek: 1,
    weekAbbreviation: "અઠવાડિયું",
    rangeSeparator: " થી ",
    scrollTitle: "સ્ક્રોલ કરીને બદલો",
    toggleTitle: "ટોગલ કરવા માટે ક્લિક કરો",
    time_24hr: false,
};

import { gujaratiNumber } from "./number";

export const updateYearToGujarati = (fp: any, locale: string) => {
    if (locale !== "gu" || !fp || !fp.currentYearElement) return;

    if (fp.currentYearElement.type !== 'text') {
        fp.currentYearElement.type = 'text';
    }

    // Intercept Flatpickr's attempts to set the value back to English digits
    if (!fp.currentYearElement._guPatched) {
        fp.currentYearElement._guPatched = true;
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        if (descriptor) {
            Object.defineProperty(fp.currentYearElement, 'value', {
                get: function() {
                    return descriptor.get?.call(this);
                },
                set: function(val) {
                    // Always enforce Gujarati characters based on currentYear
                    descriptor.set?.call(this, gujaratiNumber(fp.currentYear, "gu"));
                }
            });
        }
    }

    fp.currentYearElement.value = gujaratiNumber(fp.currentYear, "gu");
};
