const fs = require('fs');

let content = fs.readFileSync('resources/js/Pages/Admin/Pads/PadList.tsx', 'utf8');

// Add imports
content = content.replace(
    'import { usePermission } from "../../../hooks/usePermission";',
    'import { usePermission } from "../../../hooks/usePermission";\nimport enLang from "../../../lang/en.json";\nimport guLang from "../../../lang/gu.json";'
);

// Update StatusBadge
content = content.replace(
    /const StatusBadge = \({ status, isGu }: \{ status: string; isGu: boolean \}\) => \{/,
    'const StatusBadge = ({ status, t }: { status: string; t: any }) => {'
);
content = content.replace(
    /label = isGu \? "પ્રકાશિત" : "Published";/,
    'label = t.published;'
);
content = content.replace(
    /label = isGu \? "ડ્રાફ્ટ" : "Draft";/,
    'label = t.draft;'
);

// Remove translations object
content = content.replace(/const translations = \{\s*en: \{\s*createPad: "Create Pad",\s*\},\s*gu: \{\s*createPad: "પદ બનાવો",\s*\},\s*\};\s*/, '');

// Add `const t = locale === "gu" ? guLang : enLang;`
content = content.replace(
    /const isGu = locale === "gu";/,
    'const isGu = locale === "gu";\n    const t = isGu ? guLang : enLang;'
);

// Remove labels object
content = content.replace(/const labels = \{\s*en: \{\s*id: "ID",\s*title: "Pad Title",\s*lyrics: "Lyrics",\s*status: "Status",\s*createdAt: "Created At",\s*actions: "Actions",\s*\},\s*gu: \{\s*id: "ક્રમ",\s*title: "પદ શીર્ષક",\s*lyrics: "ગીતો",\s*status: "સ્થિતિ",\s*createdAt: "બનાવ્યાની તારીખ",\s*actions: "ક્રિયાઓ",\s*\},\s*\}\[locale\];\s*/, '');

// Replace toast.success pad deleted
content = content.replace(
    /isGu\s*\?\s*"પદ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું\."\s*:\s*"Pad deleted successfully",?/g,
    't.padDeleted'
);

// Replace toast.warning
content = content.replace(
    /isGu\s*\?\s*"ઓછામાં ઓછું એક પદ પસંદ કરો\."\s*:\s*"Select at least one pad\.",?/g,
    't.selectOnePad'
);

// Replace toast.success pads deleted
content = content.replace(
    /isGu\s*\?\s*"પદો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા\."\s*:\s*"Pads deleted successfully\.",?/g,
    't.padsDeleted'
);

// Replace toast.error pads delete failed
content = content.replace(
    /isGu\s*\?\s*"પદો કાઢી નાખવામાં નિષ્ફળતા\."\s*:\s*"Failed to delete pads\.",?/g,
    't.failedToDelete'
);

// Replace headers
content = content.replace(/header: labels\.id,/g, 'header: t.id,');
content = content.replace(/header: labels\.title,/g, 'header: t.padTitle,');
content = content.replace(/header: labels\.lyrics,/g, 'header: t.lyrics,');
content = content.replace(/header: labels\.status,/g, 'header: t.status,');
content = content.replace(/header: labels\.createdAt,/g, 'header: t.createdAt,');
content = content.replace(/header: labels\.actions,/g, 'header: t.actions,');

// Replace StatusBadge call
content = content.replace(/<StatusBadge\s*status=\{cellProps.getValue\(\)\}\s*isGu=\{isGu\}\s*\/>/g, '<StatusBadge status={cellProps.getValue()} t={t} />');

// Replace view, edit, delete buttons
content = content.replace(/\{isGu \? "જુઓ" : "View"\}/g, '{t.view}');
content = content.replace(/\{isGu \? "ફેરફાર કરો" : "Edit"\}/g, '{t.edit}');
content = content.replace(/\{isGu \? "કાઢી નાખો" : "Delete"\}/g, '{t.delete}');

// Replace layout strings
content = content.replace(/<Head title=\{isGu \? "પદોની યાદી" : "Pads list"\} \/>/g, '<Head title={t.padsList} />');
content = content.replace(/title=\{isGu \? "પદોની યાદી" : "Pads List"\}/g, 'title={t.padsList}');
content = content.replace(/pageTitle=\{isGu \? "પદો" : "Pads"\}/g, 'pageTitle={t.pads}');
content = content.replace(/\{isGu \? "પદો" : "Pads"\}/g, '{t.pads}');

// Replace createPad
content = content.replace(/\{\s*translations\[locale\]\.createPad\s*\}/g, '{t.createPad}');

// Replace search placeholder
content = content.replace(/isGu\s*\?\s*"પદ શીર્ષક, ગીતો, ગાયક\.\.\. શોધો"\s*:\s*"Search title, lyrics, singer\.\.\."/g, 't.searchPlaceholder');

// Replace showing pagination
content = content.replace(/\{isGu\s*\?\s*"બતાવી રહ્યા છીએ"\s*:\s*"Showing"\}/g, '{t.showing}');
content = content.replace(/\{isGu\s*\?\s*"માંથી"\s*:\s*"of"\}/g, '{t.of}');
content = content.replace(/\{isGu\s*\?\s*"પરિણામો"\s*:\s*"results"\}/g, '{t.results}');

// Replace no pads found
content = content.replace(/\{isGu\s*\?\s*"કોઈ પદ મળ્યું નથી\."\s*:\s*"No pads found\."\}/g, '{t.noPadsFound}');

// Dependency array changes
content = content.replace(/labels,/g, 't,');

fs.writeFileSync('resources/js/Pages/Admin/Pads/PadList.tsx', content);
