import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
    auth,
    db,
    storage,
    firebaseReady
} from "./firebase.js";

const productForm = document.getElementById("productForm");
const myProducts = document.getElementById("myProducts");
const dashboardMessage = document.getElementById("dashboardMessage");
const welcomeText = document.getElementById("welcomeText");
const logoutButton = document.getElementById("logoutButton");

let currentUser = null;
let authorized = false;

document.body.style.visibility = "hidden";

// الرسائل
function showMessage(message, isError = false) {
    if (!dashboardMessage) return;

    dashboardMessage.textContent = message;
    dashboardMessage.style.display = "block";
    dashboardMessage.style.color = isError ? "#c0392b" : "#287348";
}

// التحقق من Firebase
function checkFirebase() {
    if (!firebaseReady || !auth || !db || !storage) {
        showMessage("تعذر الاتصال بخدمات Firebase.", true);
        return false;
    }

    return true;
}

// زر تغيير نوع الحساب
function createRoleButton() {
    const button = document.createElement("button");

    button.textContent = "🔄 تغيير نوع الحساب";

    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 15px;
        z-index: 9999;
        padding: 13px 18px;
        border: none;
        border-radius: 12px;
        background: #246b42;
        color: white;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 12px #0002;
    `;

    button.addEventListener("click", () => {
        window.location.href = "choose-role.html";
    });

    document.body.appendChild(button);
}

// التحقق من الحساب
onAuthStateChanged(auth, async (user) => {
    if (!firebaseReady || !user) {
        window.location.replace("index.html");
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            window.location.replace("index.html");
            return;
        }

        const userData = userSnapshot.data();

        if (userData.role !== "seller") {
            window.location.replace("index.html");
            return;
        }

        currentUser = user;
        authorized = true;

        if (welcomeText) {
            welcomeText.textContent =
                `مرحباً ${userData.name || user.displayName || "بك"}، أهلاً بك في لوحة التحكم.`;
        }

        document.body.style.visibility = "visible";

        createRoleButton();

        await loadMyProducts();

    } catch (error) {
        console.error(error);
        window.location.replace("index.html");
    }
});

// إضافة منتج
if (productForm) {
    productForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!authorized || !currentUser || !checkFirebase()) {
            showMessage("ليس لديك صلاحية إضافة المنتجات.", true);
            return;
        }

        const name = document.getElementById("productName").value.trim();
        const category = document.getElementById("productCategory").value;
        const wilaya = document.getElementById("productWilaya").value;
        const price = Number(document.getElementById("productPrice").value);
        const unit = document.getElementById("productUnit").value;
        const description = document.getElementById("productDescription").value.trim();
        const imageFile = document.getElementById("productImage").files[0];

        if (!name || !category || !wilaya || !price || !unit || !imageFile) {
            showMessage("يرجى ملء جميع الحقول واختيار صورة.", true);
            return;
        }

        if (price <= 0) {
            showMessage("يرجى إدخال سعر صحيح.", true);
            return;
        }

        if (!imageFile.type.startsWith("image/")) {
            showMessage("الملف المختار يجب أن يكون صورة.", true);
            return;
        }

        if (imageFile.size > 5 * 1024 * 1024) {
            showMessage("حجم الصورة يجب ألا يتجاوز 5 ميغابايت.", true);
            return;
        }

        let imageRef = null;

        try {
            showMessage("جارٍ رفع الصورة وإضافة المنتج...");

            const imagePath =
                `products/${currentUser.uid}/${Date.now()}_${imageFile.name}`;

            imageRef = ref(storage, imagePath);

            await uploadBytes(imageRef, imageFile);

            const imageUrl = await getDownloadURL(imageRef);

            await addDoc(collection(db, "products"), {
                name,
                category,
                wilaya,
                price,
                unit,
                description,
                image: imageUrl,
                imagePath,
                sellerId: currentUser.uid,
                createdAt: serverTimestamp()
            });

            productForm.reset();

            showMessage("تمت إضافة المنتج بنجاح!");

            await loadMyProducts();

        } catch (error) {
            console.error(error);

            if (imageRef) {
                try {
                    await deleteObject(imageRef);
                } catch (_) {}
            }

            showMessage("تعذرت إضافة المنتج. تحقق من إعدادات Firebase.", true);
        }
    });
}

// عرض منتجات البائع
async function loadMyProducts() {
    if (!authorized || !currentUser || !myProducts) return;

    try {
        const productsQuery = query(
            collection(db, "products"),
            where("sellerId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(productsQuery);

        myProducts.innerHTML = "";

        if (snapshot.empty) {
            myProducts.innerHTML =
                '<p class="empty-message">لم تضف أي منتجات حتى الآن.</p>';
            return;
        }

        snapshot.forEach((productDoc) => {
            const product = productDoc.data();

            const item = document.createElement("div");
            item.className = "my-product";

            const details = document.createElement("div");

            const title = document.createElement("strong");
            title.textContent = product.name || "منتج";

            const price = document.createElement("p");
            price.textContent =
                `${Number(product.price).toLocaleString("ar-DZ")} دج / ${product.unit || "وحدة"}`;

            details.append(title, price);

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "حذف";

            deleteButton.addEventListener("click", () => {
                deleteProduct(productDoc.id, product.imagePath);
            });

            item.append(details, deleteButton);
            myProducts.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        showMessage("تعذر تحميل منتجاتك.", true);
    }
}

// حذف منتج
async function deleteProduct(productId, imagePath) {
    if (!authorized || !currentUser) return;

    if (!confirm("هل تريد حذف هذا المنتج؟")) return;

    try {
        await deleteDoc(doc(db, "products", productId));

        if (imagePath) {
            try {
                await deleteObject(ref(storage, imagePath));
            } catch (error) {
                console.warn("تعذر حذف صورة المنتج:", error);
            }
        }

        showMessage("تم حذف المنتج بنجاح.");

        await loadMyProducts();

    } catch (error) {
        console.error(error);
        showMessage("تعذر حذف المنتج.", true);
    }
}

// تسجيل الخروج
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.replace("index.html");
        } catch (error) {
            console.error(error);
            showMessage("تعذر تسجيل الخروج.", true);
        }
    });
}
