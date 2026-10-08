const fs = require('fs');
let content = fs.readFileSync('app/Http/Controllers/Pad/PadController.php', 'utf8');

content = content.replace(
    /->with\('success', \[\s*'en' => 'Pad created successfully\.',\s*'gu' => 'પદ સફળતાપૂર્વક બનાવવામાં આવ્યું\.',\s*\]\)/g,
    "->with('success', __('messages.pad_created'))"
);

content = content.replace(
    /->with\('success', \[\s*'en' => 'Pad updated successfully\.',\s*'gu' => 'પદ સફળતાપૂર્વક અપડેટ કરવામાં આવ્યું\.',\s*\]\)/g,
    "->with('success', __('messages.pad_updated'))"
);

fs.writeFileSync('app/Http/Controllers/Pad/PadController.php', content);
