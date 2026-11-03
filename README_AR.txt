سوق الفلاح | Souq Al-Fellah

الشعار:
من أرض الجزائر إلى بيتك

وصف المشروع:
سوق الفلاح منصة إلكترونية جزائرية تهدف إلى ربط الفلاحين والبائعين بالمشترين، وتسهيل عرض المنتجات الفلاحية والتعرف على أسعارها ومصادرها حسب الولاية.

محتويات المشروع:

index.html       الصفحة الرئيسية
login.html       تسجيل الدخول
register.html    إنشاء حساب
dashboard.html   لوحة تحكم البائع

css/style.css    تصميم الموقع

js/firebase.js   إعداد Firebase
js/app.js        عرض المنتجات والبحث والتصفية
js/auth.js       تسجيل الحسابات والدخول
js/dashboard.js  إدارة منتجات البائع

firestore.rules  قواعد حماية قاعدة البيانات
storage.rules    قواعد حماية الصور

التقنيات:

HTML
CSS
JavaScript
Firebase Authentication
Cloud Firestore
Firebase Storage
GitHub Pages

إعداد Firebase:

1. أنشئ مشروعاً في Firebase.
2. أضف تطبيق Web إلى المشروع.
3. انسخ معلومات Firebase Configuration.
4. ضع المعلومات في ملف js/firebase.js.
5. فعّل Email/Password في Authentication.
6. فعّل Google إذا أردت تسجيل الدخول باستخدام Google.
7. أنشئ قاعدة بيانات Cloud Firestore.
8. أنشئ Firebase Storage.
9. انشر قواعد firestore.rules في Firestore Rules.
10. انشر قواعد storage.rules في Storage Rules.
11. أضف نطاق موقع GitHub Pages إلى Authorized Domains في Firebase Authentication.

نشر الموقع:

1. افتح مستودع GitHub.
2. ادخل إلى Settings.
3. اختر Pages.
4. في Build and deployment اختر Deploy from a branch.
5. اختر main.
6. اختر / (root).
7. اضغط Save.
8. انتظر حتى يتم نشر الموقع.

رابط المشروع المتوقع:
https://moumen1392007-cpu.github.io/Souq-Al_fellah/

ملاحظة:

المشروع نسخة أولية تحتاج إلى إعداد Firebase
قبل أن تعمل الحسابات وإضافة المنتجات ورفع الصور.

يجب اختبار قواعد الأمان والوظائف قبل إطلاق
الموقع للاستخدام العام.
