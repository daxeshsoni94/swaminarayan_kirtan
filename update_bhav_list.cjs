const fs = require('fs');

let content = fs.readFileSync('resources/js/Pages/Admin/Categories/Bhav/BhavList.tsx', 'utf8');

// 1. Remove `const translations = { ... };` block
content = content.replace(
    /const translations = \{[\s\S]*?\n};\n/,
    ""
);

// 2. Change `const page = usePage().props;` and `const tr = translations[locale];`
content = content.replace(
    /const page = usePage\(\)\.props;\s*const locale = page\.locale === "gu" \? "gu" : "en";\s*const isGu = locale === "gu";\s*const \{ auth \} = usePage\(\)\.props as any;\s*const rolePrefix = auth\?\.user\?\.role\?\.name\s*\?\s*auth\.user\.role\.name\.toLowerCase\(\)\.replace\(\/\\s\+\/g, "-"\)\s*:\s*"admin";\s*const tr = translations\[locale\];/m,
    `const page = usePage().props as any;
    const { auth, translations } = page;
    const locale = (page.locale === "gu" ? "gu" : "en") as "en" | "gu";
    const isGu = locale === "gu";
    const rolePrefix = auth?.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\\s+/g, "-")
        : "admin";
    const tLang = translations || {};`
);

// 3. Replace all tr.xyz with tLang.xyz mapping
content = content.replace(/tr\.title/g, 'tLang.bhavsListTitle');
content = content.replace(/tr\.pageTitle/g, 'tLang.bhavsPageTitle');
content = content.replace(/tr\.create/g, 'tLang.createBhav');
content = content.replace(/tr\.searchPlaceholder/g, 'tLang.searchBhavPlaceholder');
content = content.replace(/tr\.noData/g, 'tLang.noBhavsFound');
content = content.replace(/tr\.showing/g, 'tLang.showing');
content = content.replace(/tr\.of/g, 'tLang.of');
content = content.replace(/tr\.results/g, 'tLang.results');
content = content.replace(/tr\.view/g, 'tLang.view');
content = content.replace(/tr\.edit/g, 'tLang.edit');
content = content.replace(/tr\.delete/g, 'tLang.delete');

// Replace table header labels logic to use tLang directly
content = content.replace(
    /const labels = \{[\s\S]*?\}\[locale\];/m,
    `const labels = {
        id: tLang.id || "ID",
        value: tLang.value || (isGu ? "ભાવ " : "Bhav"),
        padsCount: tLang.padsCount || (isGu ? "કુલ પદો" : "Total Pads"),
        createdAt: tLang.createdAt || "Created At",
        actions: tLang.actions || "Actions",
    };`
);

// 4. Remove toast.success(tr.deleteSuccess) inside onDeleteClick -> onSuccess
content = content.replace(
    /onSuccess: \(\) => \{\s*setDeleteModal\(false\);\s*toast\.success\(tr\.deleteSuccess\);\s*\}/m,
    `onSuccess: () => {
                    setDeleteModal(false);
                }`
);

// 5. Remove toast.success/toast.error from bulk delete
content = content.replace(
    /onSuccess: \(\) => \{\s*toast\.success\(tr\.bulkDeleteSuccess\);\s*setSelectedIds\(\[\]\);\s*setIsMultiDeleteButton\(false\);\s*setDeleteModalMulti\(false\);\s*\},\s*onError: \(\) => \{\s*toast\.error\(tr\.bulkDeleteFail\);\s*\}/m,
    `onSuccess: () => {
                    setSelectedIds([]);
                    setIsMultiDeleteButton(false);
                    setDeleteModalMulti(false);
                }`
);

// 6. Replace `toast.warning(tr.selectAtLeastOne)`
content = content.replace(
    /toast\.warning\(tr\.selectAtLeastOne\);/g,
    `toast.warning(tLang.selectOnePad);`
);

fs.writeFileSync('resources/js/Pages/Admin/Categories/Bhav/BhavList.tsx', content);
