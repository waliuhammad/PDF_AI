/**
 * UI copy, keyed by message id.
 *
 * English is the source: every other locale is looked up against it and falls
 * back to it per key, so a partly translated locale shows translated strings
 * where it has them and English everywhere else, rather than blanks.
 *
 * Settings offers 58 languages. Hand-writing 58 full catalogues is not
 * realistic, so the shape here is deliberately incremental — a locale is
 * whatever subset of these keys someone has translated.
 */

export const MESSAGES = {
    en: {
        "nav.dashboard": "Dashboard",
        "nav.documents": "My Documents",
        "nav.chats": "Chats",
        "nav.tools": "Tools",
        "nav.settings": "Settings",
        "nav.logout": "Log out",
        "nav.upgradeTitle": "Upgrade to Pro",
        "nav.upgradeBody": "Unlock unlimited chats & more.",
        "nav.upgradeCta": "Upgrade Now",

        "dashboard.welcome": "Welcome back",
        "dashboard.subtitle": "Here's what's happening with your documents.",
        "dashboard.totalDocuments": "Total Documents",
        "dashboard.totalChats": "Total Chats",
        "dashboard.storageUsed": "Storage Used",
        "dashboard.favorites": "Favorites",
        "dashboard.recentDocuments": "Recent Documents",
        "dashboard.recentChats": "Recent Chats",
        "dashboard.viewAll": "View all",
        "dashboard.quickActions": "Quick Actions",
        "dashboard.noDocuments": "No documents yet — upload your first PDF to get started.",
        "dashboard.freePlan": "Free Plan",
        "dashboard.paidPlan": "Paid Plan",

        "usage.title": "Tools Usage Today",
        "usage.plan": "{plan} plan",
        "usage.used": "{used} of {limit} operations used",
        "usage.limitReached": "Limit reached — {used} of {limit} operations used",
        "usage.upgrade": "Upgrade for a higher daily allowance →",

        "settings.title": "Settings",
        "settings.profile": "Profile",
        "settings.theme": "Theme",
        "settings.notifications": "Notifications",
        "settings.password": "Password",
        "settings.language": "Language",
        "settings.billing": "Subscription & Billing",
        "settings.interfaceLanguage": "Interface language",
        "settings.searchLanguages": "Search languages...",

        "documents.title": "My Documents",
        "documents.upload": "Upload PDF",
        "documents.searchPlaceholder": "Search documents...",
        "documents.all": "All",
        "documents.favorites": "Favorites",
        "documents.storageUsed": "{used} of {limit} GB used",

        "common.cancel": "Cancel",
        "common.save": "Save",
        "common.delete": "Delete",
        "common.download": "Download",
        "common.close": "Close",
        "common.loading": "Loading...",
    },

    es: {
        "nav.dashboard": "Panel",
        "nav.documents": "Mis documentos",
        "nav.chats": "Chats",
        "nav.tools": "Herramientas",
        "nav.settings": "Ajustes",
        "nav.logout": "Cerrar sesión",
        "nav.upgradeTitle": "Mejora a Pro",
        "nav.upgradeBody": "Desbloquea chats ilimitados y más.",
        "nav.upgradeCta": "Mejorar ahora",

        "dashboard.welcome": "Bienvenido de nuevo",
        "dashboard.subtitle": "Esto es lo que ocurre con tus documentos.",
        "dashboard.totalDocuments": "Documentos totales",
        "dashboard.totalChats": "Chats totales",
        "dashboard.storageUsed": "Almacenamiento usado",
        "dashboard.favorites": "Favoritos",
        "dashboard.recentDocuments": "Documentos recientes",
        "dashboard.recentChats": "Chats recientes",
        "dashboard.viewAll": "Ver todo",
        "dashboard.quickActions": "Acciones rápidas",
        "dashboard.noDocuments": "Aún no hay documentos: sube tu primer PDF para empezar.",
        "dashboard.freePlan": "Plan gratuito",
        "dashboard.paidPlan": "Plan de pago",

        "usage.title": "Uso de herramientas hoy",
        "usage.plan": "plan {plan}",
        "usage.used": "{used} de {limit} operaciones usadas",
        "usage.limitReached": "Límite alcanzado — {used} de {limit} operaciones usadas",
        "usage.upgrade": "Mejora tu plan para un límite diario mayor →",

        "settings.title": "Ajustes",
        "settings.profile": "Perfil",
        "settings.theme": "Tema",
        "settings.notifications": "Notificaciones",
        "settings.password": "Contraseña",
        "settings.language": "Idioma",
        "settings.billing": "Suscripción y facturación",
        "settings.interfaceLanguage": "Idioma de la interfaz",
        "settings.searchLanguages": "Buscar idiomas...",

        "documents.title": "Mis documentos",
        "documents.upload": "Subir PDF",
        "documents.searchPlaceholder": "Buscar documentos...",
        "documents.all": "Todos",
        "documents.favorites": "Favoritos",
        "documents.storageUsed": "{used} de {limit} GB usados",

        "common.cancel": "Cancelar",
        "common.save": "Guardar",
        "common.delete": "Eliminar",
        "common.download": "Descargar",
        "common.close": "Cerrar",
        "common.loading": "Cargando...",
    },

    ar: {
        "nav.dashboard": "لوحة التحكم",
        "nav.documents": "مستنداتي",
        "nav.chats": "المحادثات",
        "nav.tools": "الأدوات",
        "nav.settings": "الإعدادات",
        "nav.logout": "تسجيل الخروج",
        "nav.upgradeTitle": "الترقية إلى Pro",
        "nav.upgradeBody": "محادثات غير محدودة والمزيد.",
        "nav.upgradeCta": "ترقية الآن",

        "dashboard.welcome": "مرحبًا بعودتك",
        "dashboard.subtitle": "إليك ما يحدث في مستنداتك.",
        "dashboard.totalDocuments": "إجمالي المستندات",
        "dashboard.totalChats": "إجمالي المحادثات",
        "dashboard.storageUsed": "المساحة المستخدمة",
        "dashboard.favorites": "المفضلة",
        "dashboard.recentDocuments": "أحدث المستندات",
        "dashboard.recentChats": "أحدث المحادثات",
        "dashboard.viewAll": "عرض الكل",
        "dashboard.quickActions": "إجراءات سريعة",
        "dashboard.noDocuments": "لا توجد مستندات بعد — ارفع أول ملف PDF للبدء.",
        "dashboard.freePlan": "الخطة المجانية",
        "dashboard.paidPlan": "الخطة المدفوعة",

        "usage.title": "استخدام الأدوات اليوم",
        "usage.plan": "خطة {plan}",
        "usage.used": "{used} من {limit} عملية مستخدمة",
        "usage.limitReached": "تم بلوغ الحد — {used} من {limit} عملية مستخدمة",
        "usage.upgrade": "الترقية للحصول على حد يومي أعلى →",

        "settings.title": "الإعدادات",
        "settings.profile": "الملف الشخصي",
        "settings.theme": "المظهر",
        "settings.notifications": "الإشعارات",
        "settings.password": "كلمة المرور",
        "settings.language": "اللغة",
        "settings.billing": "الاشتراك والفوترة",
        "settings.interfaceLanguage": "لغة الواجهة",
        "settings.searchLanguages": "ابحث عن لغة...",

        "documents.title": "مستنداتي",
        "documents.upload": "رفع PDF",
        "documents.searchPlaceholder": "ابحث في المستندات...",
        "documents.all": "الكل",
        "documents.favorites": "المفضلة",
        "documents.storageUsed": "{used} من {limit} غيغابايت مستخدمة",

        "common.cancel": "إلغاء",
        "common.save": "حفظ",
        "common.delete": "حذف",
        "common.download": "تنزيل",
        "common.close": "إغلاق",
        "common.loading": "جارٍ التحميل...",
    },
} as const;

/** Every key the UI can ask for; English defines the set. */
export type MessageKey = keyof (typeof MESSAGES)["en"];

/** Locales with at least a partial catalogue. */
export type Locale = keyof typeof MESSAGES;

export const TRANSLATED_LOCALES = Object.keys(MESSAGES) as Locale[];

/** Written right-to-left, so the document direction has to follow the choice. */
export const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);
