/**
 * Multi-Language System (English / Arabic)
 * Stores user preference in localStorage and translates all data-i18n elements.
 */

const translations = {
  en: {
    // Navbar
    home: "Home",
    playground: "Playground",
    loadouts: "Loadouts",
    sign_in: "Sign In",

    // Hero
    hero_badge: "Next-Gen Roblox Script Vault",
    hero_title_1: "ROBLOX SCRIPT",
    hero_title_2: "NEXUS",
    hero_desc: "High-performance, obfuscated Lua scripts & loadout builder for top Roblox game maps. 100% Free, secure, & updated daily.",
    maps_vault: "Maps Vault",
    executor_safe: "Executor Safe",
    encrypted_loaders: "Encrypted Loaders",
    search_placeholder: "Search game maps or scripts...",
    search_btn: "SEARCH",
    featured_maps: "FEATURED MAPS",
    trending_now: "TRENDING NOW",
    game_map_vault: "GAME MAP VAULT",
    view_scripts: "View Scripts",

    // Map Page
    available_scripts: "AVAILABLE SCRIPTS",
    all: "All",
    sign_in_to_copy: "Sign In to Copy",
    copy_loader: "Copy Loader",
    add_to_loadout: "Add to Loadout",
    protected_script: "PROTECTED EXECUTOR SCRIPT",
    protected_desc: "Please sign in with your Google account to unlock and copy this script shortcut.",
    sign_in_unlock: "Sign In To Unlock",
    executor_shortcut: "Executor Loadstring Shortcut",
    source_protected: "Source Protected",
    community_comments: "COMMUNITY COMMENTS",
    toggle_comments: "Toggle Comments",
    no_comments: "No comments yet. Be the first to comment!",
    write_comment: "Write a comment...",
    post: "Post",
    sign_in_to_comment: "Sign in to post comments.",
    undetected: "UNDETECTED",

    // Profile
    verified_user: "Verified User",
    member_since: "Member since",
    sign_out: "Sign Out",
    saved_scripts: "YOUR SAVED & LIKED SCRIPTS",
    saved: "Saved",
    view_map: "View Map",
    no_liked_scripts: "No Liked Scripts Yet",
    no_liked_desc: "Browse script vaults and click the heart icon to save your favorite scripts here.",
    sign_in_google: "SIGN IN WITH GOOGLE",
    sign_in_desc: "Sign in with your Google account to unlock executor script shortcuts, post comments, and save your loadouts.",
    display_name: "DISPLAY NAME",
    gmail_address: "GMAIL ADDRESS",
    continue_google: "Continue with Google",

    // General
    scripts: "Scripts",
    language: "العربية"
  },

  ar: {
    // Navbar
    home: "الرئيسية",
    playground: "ملعب التجربة",
    loadouts: "حزم التشغيل",
    sign_in: "تسجيل الدخول",

    // Hero
    hero_badge: "مخزن سكريبتات روبلوكس الجيل الجديد",
    hero_title_1: "سكريبتات روبلوكس",
    hero_title_2: "نيكسس",
    hero_desc: "سكريبتات لوا عالية الأداء ومُشفّرة وأداة بناء حزم تشغيل لأفضل خرائط روبلوكس. مجاني 100%، آمن، ومُحدّث يومياً.",
    maps_vault: "خزنة الخرائط",
    executor_safe: "آمن للمُنفّذ",
    encrypted_loaders: "تحميل مُشفّر",
    search_placeholder: "ابحث عن خرائط أو سكريبتات...",
    search_btn: "بحث",
    featured_maps: "الخرائط المميزة",
    trending_now: "رائج الآن",
    game_map_vault: "خزنة خرائط الألعاب",
    view_scripts: "عرض السكريبتات",

    // Map Page
    available_scripts: "السكريبتات المتاحة",
    all: "الكل",
    sign_in_to_copy: "سجّل دخولك للنسخ",
    copy_loader: "نسخ المُحمّل",
    add_to_loadout: "أضف للحزمة",
    protected_script: "سكريبت محمي للمُنفّذ",
    protected_desc: "يرجى تسجيل الدخول بحسابك في قوقل لفتح ونسخ اختصار هذا السكريبت.",
    sign_in_unlock: "سجّل دخولك لفتح القفل",
    executor_shortcut: "اختصار تحميل المُنفّذ",
    source_protected: "المصدر محمي",
    community_comments: "تعليقات المجتمع",
    toggle_comments: "إظهار/إخفاء التعليقات",
    no_comments: "لا توجد تعليقات بعد. كن أول من يعلّق!",
    write_comment: "اكتب تعليقاً...",
    post: "نشر",
    sign_in_to_comment: "سجّل دخولك لكتابة التعليقات.",
    undetected: "غير مكتشف",

    // Profile
    verified_user: "مستخدم موثّق",
    member_since: "عضو منذ",
    sign_out: "تسجيل الخروج",
    saved_scripts: "سكريبتاتك المحفوظة والمفضّلة",
    saved: "محفوظ",
    view_map: "عرض الخريطة",
    no_liked_scripts: "لا توجد سكريبتات مفضّلة بعد",
    no_liked_desc: "تصفّح خزنة السكريبتات واضغط على أيقونة القلب لحفظ سكريبتاتك المفضّلة هنا.",
    sign_in_google: "تسجيل الدخول بحساب قوقل",
    sign_in_desc: "سجّل دخولك بحساب قوقل لفتح اختصارات السكريبتات ونشر التعليقات وحفظ حزم التشغيل.",
    display_name: "اسم العرض",
    gmail_address: "عنوان Gmail",
    continue_google: "المتابعة بحساب قوقل",

    // General
    scripts: "سكريبتات",
    language: "English"
  }
};

function getLang() {
  return localStorage.getItem('nexus_lang') || 'en';
}

function setLang(lang) {
  localStorage.setItem('nexus_lang', lang);
  applyLang(lang);
}

function toggleLang() {
  const current = getLang();
  const next = current === 'en' ? 'ar' : 'en';
  setLang(next);
}

function applyLang(lang) {
  const t = translations[lang] || translations.en;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);

  // Translate all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });

  // Translate placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.placeholder = t[key];
  });

  // Update language toggle button text
  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) {
    langBtn.textContent = t.language || (lang === 'en' ? 'العربية' : 'English');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang(getLang());
});
