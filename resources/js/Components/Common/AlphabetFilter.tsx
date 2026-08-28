import React from "react";
import { usePage } from "@inertiajs/react";

interface AlphabetFilterProps {
    selectedLetter?: string;
    onSelect: (letter: string) => void;
    className?: string;
}

const englishLetters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
];

const gujaratiLetters = [
    "અ", "આ", "ઇ", "ઈ", "ઉ", "ઊ", "ઋ", "એ", "ઐ", "ઓ", "ઔ",
    "ક", "ખ", "ગ", "ઘ", "ઙ",
    "ચ", "છ", "જ", "ઝ", "ઞ",
    "ટ", "ઠ", "ડ", "ઢ", "ણ",
    "ત", "થ", "દ", "ધ", "ન",
    "પ", "ફ", "બ", "ભ", "મ",
    "ય", "ર", "લ", "વ",
    "શ", "ષ", "સ", "હ", "ળ",
    "ક્ષ", "જ્ઞ",
];

const AlphabetFilter: React.FC<AlphabetFilterProps> = ({
    selectedLetter = "",
    onSelect,
    className = "",
}) => {
    const { locale } = usePage().props as { locale?: string };
    const isGu = locale === "gu";
    const alphabet = isGu ? gujaratiLetters : englishLetters;

    return (
        <div className={`mb-3 ${className}`}>
            <div
                className="d-flex gap-1 overflow-auto pb-2"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {alphabet.map((letter) => (
                    <button
                        key={letter}
                        type="button"
                        onClick={() => onSelect(letter === selectedLetter ? "" : letter)}
                        className={`btn btn-sm flex-shrink-0 ${
                            selectedLetter === letter
                                ? "btn-primary"
                                : "btn-soft-secondary"
                        }`}
                        style={{
                            width: 38,
                            height: 38,
                            minWidth: 38,
                            minHeight: 38,
                            padding: 0,
                            borderRadius: "50%",
                            fontSize: isGu ? 14 : 13,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                        }}
                    >
                        {letter}
                    </button>
                ))}

                {selectedLetter && (
                    <button
                        type="button"
                        onClick={() => onSelect("")}
                        className="btn btn-sm btn-soft-danger flex-shrink-0"
                        style={{
                            width: 38,
                            height: 38,
                            minWidth: 38,
                            minHeight: 38,
                            padding: 0,
                            borderRadius: "50%",
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        title={isGu ? "ફિલ્ટર સાફ કરો" : "Clear filter"}
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export default AlphabetFilter;