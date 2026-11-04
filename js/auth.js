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

function showMessage(message, isError = false) {
if (!authMessage) return;

authMessage.textContent = message;
authMessage.style.display = "block";
authMessage.style.color = isError ? "#c0392b" : "#287443";

}

function checkFirebase() {
if (!firebaseReady || !auth || !db) {
showMessage("تعذر الاتصال بقاعدة البيانات. حاول لاحقاً.", true);
return false;
}

return true;

}

// حفظ معلومات المستخدم
async function saveUser(user, name = "", role = "buyer", wilaya = "") {
const userRef = doc(db, "users", user.uid);
const snapshot = await getDoc(userRef);

if (!snapshot.exists()) {
    const userData = {
        uid: user.uid,
        name: name || user.displayName || "مستخدم",
        email: user.email || "",
        role: role,
        wilaya: wilaya,
        createdAt: serverTimestamp()
    };

    await setDoc(userRef, userData);
    return userData;
}

return snapshot.data();

}

// الانتقال إلى واجهة السوق
function goToMarket() {
window.location.replace("index.html");
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

    if (password.length < 6) {
        showMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل.", true);
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

        showMessage("تم إنشاء حسابك بنجاح!");

        setTimeout(goToMarket, 800);

    } catch (error) {
        console.error(error);
        showMessage(getErrorMessage(error), true);
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

        // التأكد من وجود بيانات المستخدم
        await saveUser(result.user);

        showMessage("تم تسجيل الدخول بنجاح!");

        setTimeout(goToMarket, 800);

    } catch (error) {
        console.error(error);
        showMessage(getErrorMessage(error), true);
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
        result.user.displayName || "مستخدم",
        "buyer",
        ""
    );

    showMessage("تم تسجيل الدخول بنجاح!");

    setTimeout(goToMarket, 800);

} catch (error) {
    console.error(error);
    showMessage(getErrorMessage(error), true);
}

}

if (googleLogin) {
googleLogin.addEventListener("click", googleSignIn);
}

if (googleRegister) {
googleRegister.addEventListener("click", googleSignIn);
}

// ترجمة رسائل الأخطاء
function getErrorMessage(error) {
const messages = {
"auth/email-already-in-use":
"هذا البريد الإلكتروني مستخدم بالفعل.",

    "auth/invalid-email":
        "البريد الإلكتروني غير صحيح.",

    "auth/weak-password":
        "كلمة المرور ضعيفة جداً.",

    "auth/user-not-found":
        "هذا الحساب غير موجود.",

    "auth/wrong-password":
        "كلمة المرور غير صحيحة.",

    "auth/invalid-credential":
        "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

    "auth/popup-closed-by-user":
        "تم إغلاق نافذة Google.",

    "auth/popup-blocked":
        "المتصفح منع نافذة Google. اسمح بالنوافذ المنبثقة.",

    "auth/unauthorized-domain":
        "عنوان الموقع غير مضاف إلى النطاقات المسموح بها في Firebase.",

    "auth/network-request-failed":
        "تحقق من اتصال الإنترنت."
};

return messages[error.code] ||
    "حدث خطأ أثناء العملية. حاول مرة أخرى.";

}
