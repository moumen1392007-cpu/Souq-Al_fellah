import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    auth,
    db,
    firebaseReady
} from "./firebase.js";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

const googleLogin = document.getElementById("googleLogin");
const googleRegister = document.getElementById("googleRegister");

const authMessage = document.getElementById("authMessage");

// عرض الرسائل
function showMessage(message, isError = false) {
    if (!authMessage) return;

    authMessage.textContent = message;
    authMessage.style.color = isError ? "#c0392b" : "#287b49";
}

// التحقق من Firebase
function checkFirebase() {
    if (!firebaseReady || !auth || !db) {
        showMessage("تعذر الاتصال بالخادم. حاول مجدداً.", true);
        return false;
    }

    return true;
}

// إنشاء أو تحديث بيانات المستخدم
async function saveUser(user, name = "", role = "buyer", wilaya = "") {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            name: name || user.displayName || "",
            email: user.email || "",
            role: role,
            wilaya: wilaya,
            createdAt: serverTimestamp()
        });
    }

    return true;
}

// الانتقال إلى اختيار الدور
function goToMarket() {
    window.location.replace("choose-role.html");
}

// إنشاء حساب بالبريد الإلكتروني
if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!checkFirebase()) return;

        const name = document.getElementById("fullName").value.trim();
        const role = document.getElementById("role").value;
        const wilaya = document.getElementById("wilaya").value;
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!name || !role || !wilaya || !email || !password) {
            showMessage("يرجى ملء جميع الحقول.", true);
            return;
        }

        try {
            showMessage("جارٍ إنشاء حسابك...");

            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await updateProfile(result.user, {
                displayName: name
            });

            await saveUser(result.user, name, role, wilaya);

            showMessage("تم إنشاء الحساب بنجاح!");

            setTimeout(goToMarket, 700);

        } catch (error) {
            console.error(error);
            showMessage(getErrorMessage(error.code), true);
        }
    });
}

// تسجيل الدخول بالبريد الإلكتروني
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!checkFirebase()) return;

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showMessage("أدخل البريد الإلكتروني وكلمة المرور.", true);
            return;
        }

        try {
            showMessage("جارٍ تسجيل الدخول...");

            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            await saveUser(result.user);

            showMessage("تم تسجيل الدخول بنجاح!");

            setTimeout(goToMarket, 700);

        } catch (error) {
            console.error(error);
            showMessage(getErrorMessage(error.code), true);
        }
    });
}

// تسجيل الدخول باستخدام Google
async function googleSignIn() {
    if (!checkFirebase()) return;

    try {
        showMessage("جارٍ الاتصال بحساب Google...");

        const provider = new GoogleAuthProvider();

        const result = await signInWithPopup(auth, provider);

        await saveUser(
            result.user,
            result.user.displayName || "",
            "buyer",
            ""
        );

        showMessage("تم تسجيل الدخول بنجاح!");

        setTimeout(goToMarket, 700);

    } catch (error) {
        console.error(error);
        showMessage(getErrorMessage(error.code), true);
    }
}

if (googleLogin) {
    googleLogin.addEventListener("click", googleSignIn);
}

if (googleRegister) {
    googleRegister.addEventListener("click", googleSignIn);
}

// ترجمة رسائل الأخطاء
function getErrorMessage(code) {
    const errors = {
        "auth/email-already-in-use": "هذا البريد الإلكتروني مستخدم بالفعل.",
        "auth/invalid-email": "البريد الإلكتروني غير صحيح.",
        "auth/weak-password": "كلمة المرور ضعيفة جداً.",
        "auth/user-not-found": "الحساب غير موجود.",
        "auth/wrong-password": "كلمة المرور غير صحيحة.",
        "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        "auth/popup-closed-by-user": "أغلقت نافذة Google قبل إكمال العملية.",
        "auth/popup-blocked": "المتصفح منع نافذة تسجيل الدخول.",
        "auth/unauthorized-domain": "النطاق غير مصرح به في Firebase.",
        "auth/network-request-failed": "تحقق من اتصال الإنترنت."
    };

    return errors[code] || "حدث خطأ، حاول مرة أخرى.";
}
