const fs = require('fs');

let content = fs.readFileSync('resources/js/Pages/Admin/Categories/Bhav/BhavList.tsx', 'utf8');

// remove translation block
content = content.replace(
    /const translations = \{[\s\S]*?\n};\n/m,
    ""
);

content = content.replace(
    /toast\.success\(tLang\.deleteSuccess\);/g,
    ""
);

fs.writeFileSync('resources/js/Pages/Admin/Categories/Bhav/BhavList.tsx', content);
