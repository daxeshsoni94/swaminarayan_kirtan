/**
 * Digit maps per locale.
 * Add a new language here only — nowhere else.
 *
 * Key   = language code (same as languages.code)
 * Value = array of 10 digit characters (0–9)
 */
const LOCALE_DIGITS: Record<string, string[]> = {
    en: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    gu: ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"],

    // Future examples — uncomment / add when needed:
    // hi: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"], // Devanagari
    // ar: ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"], // Arabic-Indic
    // fa: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"], // Persian
    // bn: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"], // Bengali
};

/**
 * Convert Western digits (0–9) to locale-specific digits.
 * Unknown locale → returns original string (Western digits).
 */
export const formatNumber = (
    value: number | string,
    locale: string = "en",
): string => {
    const text = String(value ?? "");
    const digits = LOCALE_DIGITS[locale];

    // No map for this locale → keep Western digits
    if (!digits) {
        return text;
    }

    return text.replace(/\d/g, (d) => digits[Number(d)] ?? d);
};

/**
 * Backward-compatible alias (old name still works)
 */
export const gujaratiNumber = formatNumber;
