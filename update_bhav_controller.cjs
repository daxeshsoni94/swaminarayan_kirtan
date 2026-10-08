const fs = require('fs');
let content = fs.readFileSync('app/Http/Controllers/Category/BhavController.php', 'utf8');

content = content.replace(
    /->with\('success', \$locale === 'gu'\s*\?\s*'ભાવ સફળતાપૂર્વક બનાવવામાં આવ્યો\.'\s*:\s*'Bhav created successfully\.'\);/g,
    "->with('success', __('messages.bhavCreated'));"
);

content = content.replace(
    /->with\('success', \$locale === 'gu'\s*\?\s*'ભાવ સફળતાપૂર્વક અપડેટ કરવામાં આવ્યો\.'\s*:\s*'Bhav updated successfully\.'\);/g,
    "->with('success', __('messages.bhavUpdated'));"
);

content = content.replace(
    /\$message = \$deleteRelatedPads\s*\?\s*\(\$locale === 'gu'\s*\?\s*'ભાવ અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા\.'\s*:\s*'Bhav and its related pads deleted successfully\.'\)\s*:\s*\(\$locale === 'gu'\s*\?\s*'ભાવ સફળતાપૂર્વક કાઢી નાખ્યો\.'\s*:\s*'Bhav deleted successfully\.'\);/g,
    "$message = $deleteRelatedPads ? __('messages.bhavAndPadsDeleted') : __('messages.bhavDeleted');"
);

content = content.replace(
    /\$message = \$deleteRelatedPads\s*\?\s*\(\$locale === 'gu'\s*\?\s*'ભાવ અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા\.'\s*:\s*'Bhavs and its related pads deleted successfully\.'\)\s*:\s*\(\$locale === 'gu'\s*\?\s*'ભાવ સફળતાપૂર્વક કાઢી નાખ્યા\.'\s*:\s*'Bhavs deleted successfully\.'\);/g,
    "$message = $deleteRelatedPads ? __('messages.bhavsAndPadsDeleted') : __('messages.bhavsDeleted');"
);

fs.writeFileSync('app/Http/Controllers/Category/BhavController.php', content);
