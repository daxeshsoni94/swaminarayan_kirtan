const fs = require('fs');

let en = fs.readFileSync('lang/en/messages.php', 'utf8');
en = en.replace(
    /];/,
    "    'bhavCreated' => 'Bhav created successfully.',\n" +
    "    'bhavUpdated' => 'Bhav updated successfully.',\n" +
    "    'bhavDeleted' => 'Bhav deleted successfully.',\n" +
    "    'bhavAndPadsDeleted' => 'Bhav and its related pads deleted successfully.',\n" +
    "    'bhavsDeleted' => 'Bhavs deleted successfully.',\n" +
    "    'bhavsAndPadsDeleted' => 'Bhavs and their related pads deleted successfully.',\n" +
    "];"
);
fs.writeFileSync('lang/en/messages.php', en);

let gu = fs.readFileSync('lang/gu/messages.php', 'utf8');
gu = gu.replace(
    /];/,
    "    'bhavCreated' => 'ભાવ સફળતાપૂર્વક બનાવવામાં આવ્યો.',\n" +
    "    'bhavUpdated' => 'ભાવ સફળતાપૂર્વક અપડેટ કરવામાં આવ્યો.',\n" +
    "    'bhavDeleted' => 'ભાવ સફળતાપૂર્વક કાઢી નાખ્યો.',\n" +
    "    'bhavAndPadsDeleted' => 'ભાવ અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા.',\n" +
    "    'bhavsDeleted' => 'ભાવ સફળતાપૂર્વક કાઢી નાખ્યા.',\n" +
    "    'bhavsAndPadsDeleted' => 'ભાવ અને તેના બધા પદો સફળતાપૂર્વક કાઢી નાખ્યા.',\n" +
    "];"
);
fs.writeFileSync('lang/gu/messages.php', gu);
