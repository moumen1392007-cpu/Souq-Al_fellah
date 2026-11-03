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
authMessage.style.color = isError ? "#c0392b" : "#287348";

}

function checkFirebase() {
if (!firebaseReady || !auth || !db) {
showMessage("يجب إعداد Firebase أولاً حتى تعمل الحسابات.", true);
return false;
}

return true;

}

// حفظ معلومات المستخدم في قاعدة البيانات
async function saveUser(user, name, role, wilaya) {
const userRef = doc(db, "users", user.uid);
const userSnapshot = await getDoc(userRef);

if (!userSnapshot.exists()) {
    await setDoc(userRef, {
        uid: user.uid,
        name: name || user.displayName || "مستخدم",
        email: user.email,
        role: role || "buyer",
        wilaya: wilaya || "",
        createdAt: serverTimestamp()
    });
}

return userSnapshot.exists()
    ? userSnapshot.data()
    : { role: role || "buyer" };

}

// التسجيل بالبريد الإلكتروني
if (registerForm) {
registerForm.addEventListener("submit", async (event) => {
event.preventDefault();

    if (!checkFirebase()) return;

    const name = document.getElementById("fullName").value.trim();
    const role = document.getElementById("role").value;
    const wilaya = document.getElementById("wilaya").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password || !role || !wilaya) {
        showMessage("يرجى ملء جميع الحقول.", true);
        return;
    }

    if (password.length < 6) {
        showMessage("كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.", true);
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

        setTimeout(() => {
            window.location.href =
                role === "seller" ? "dashboard.html" : "index.html";
        }, 1200);

    } catch (error) {
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

    try {
        showMessage("جارٍ تسجيل الدخول...");

        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const userRef = doc(db, "users", result.user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            showMessage("لم يتم العثور على بيانات الحساب.", true);
            return;
        }

        const userData = userSnapshot.data();

        showMessage("تم تسجيل الدخول بنجاح!");

        setTimeout(() => {
            window.location.href =
                userData.role === "seller"
                    ? "dashboard.html"
                    : "index.html";
        }, 1000);

    } catch (error) {
        showMessage(getErrorMessage(error), true);
    }
});

}

// الدخول والتسجيل باستخدام Google
async function googleSignIn() {
if (!checkFirebase()) return;

try {
    showMessage("جارٍ فتح حساب Google...");

    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const userRef = doc(db, "users", result.user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        await setDoc(userRef, {
            uid: result.user.uid,
            name: result.user.displayName || "مستخدم",
            email: result.user.email,
            role: "buyer",
            wilaya: "",
            createdAt: serverTimestamp()
        });
    }

    showMessage("تم تسجيل الدخول بنجاح!");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);

} catch (error) {
    showMessage(getErrorMessage(error), true);
}

}

if (googleLogin) {
googleLogin.addEventListener("click", googleSignIn);
}

if (googleRegister) {
googleRegister.addEventListener("click", googleSignIn);
}

// رسائل الأخطاء بالعربية
function getErrorMessage(error) {
const messages = {
"auth/email-already-in-use": "هذا البريد الإلكتروني مستخدم بالفعل.",
"auth/invalid-email": "البريد الإلكتروني غير صحيح.",
"auth/weak-password": "كلمة المرور ضعيفة جداً.",
"auth/user-not-found": "الحساب غير موجود.",
"auth/wrong-password": "كلمة المرور غير صحيحة.",
"auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
"auth/popup-closed-by-user": "تم إغلاق نافذة Google.",
"auth/network-request-failed": "تحقق من اتصال الإنترنت."
};

return messages[error.code] || "حدث خطأ، يرجى المحاولة مرة أخرى.";

  }
