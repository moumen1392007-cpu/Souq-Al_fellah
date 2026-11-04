import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// عناصر الصفحة
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusMessage = document.getElementById("statusMessage");

// قائمة المنتجات
let allProducts = [];

// توحيد أسماء التصنيفات
const categoryMap = {
    "خضر": "vegetables",
    "الخضر": "vegetables",
    "vegetables": "vegetables",

    "فواكه": "fruits",
    "الفواكه": "fruits",
    "fruits": "fruits",

    "حبوب": "grains",
    "الحبوب": "grains",
    "grains": "grains",

    "أخرى": "other",
    "اخرى": "other",
    "other": "other"
};

// أسماء التصنيفات للعرض
const categoryNames = {
    vegetables: "خضر",
    fruits: "فواكه",
    grains: "حبوب",
    other: "أخرى"
};

// توحيد النصوص لتسهيل البحث
function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, " ");
}

// تحويل التصنيف إلى صيغة موحدة
function normalizeCategory(category) {
    const value = normalizeText(category);
    return categoryMap[value] || value;
}

// حماية النصوص عند عرضها في HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];
    });
}

// جلب المنتجات من Firestore
async function loadProducts() {
    try {
        statusMessage.textContent = "جارٍ تحميل المنتجات...";

        const snapshot = await getDocs(collection(db, "products"));

        allProducts = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }));

        // ترتيب المنتجات من الأحدث إلى الأقدم
        allProducts.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;

            return dateB - dateA;
        });

        displayProducts(allProducts);

    } catch (error) {
        console.error("خطأ في تحميل المنتجات:", error);

        statusMessage.textContent =
            "تعذر تحميل المنتجات. تحقق من اتصالك بالإنترنت.";

        productsGrid.innerHTML = "";
    }
}

// عرض المنتجات
function displayProducts(products) {
    productsGrid.innerHTML = "";

    if (products.length === 0) {
        statusMessage.textContent = "لم يتم العثور على منتجات.";
        return;
    }

    statusMessage.textContent = `عدد المنتجات: ${products.length}`;

    products.forEach(product => {
        const name = escapeHTML(product.name || "منتج بدون اسم");
        const price = escapeHTML(product.price ?? "غير محدد");
        const location = escapeHTML(product.location || "الموقع غير محدد");
        const description = escapeHTML(product.description || "");
        const category = normalizeCategory(product.category);
        const categoryName = escapeHTML(
            categoryNames[category] || product.category || "أخرى"
        );

        const image = product.imageUrl
            ? escapeHTML(product.imageUrl)
            : "";

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            ${
                image
                    ? `<img src="${image}" alt="${name}" class="product-image">`
                    : `<div class="product-image-placeholder">🌱</div>`
            }

            <div class="product-info">
                <span class="product-category">${categoryName}</span>

                <h3>${name}</h3>

                <p class="product-price">
                    ${price} دج
                </p>

                <p class="product-location">
                    📍 ${location}
                </p>

                ${
                    description
                        ? `<p class="product-description">${description}</p>`
                        : ""
                }
            </div>
        `;

        productsGrid.appendChild(card);
    });
}

// البحث والتصفية
function filterProducts() {
    const searchText = normalizeText(searchInput.value);

    const selectedCategory = normalizeCategory(
        categoryFilter.value
    );

    const filteredProducts = allProducts.filter(product => {

        const productName = normalizeText(product.name);
        const productLocation = normalizeText(product.location);
        const productDescription = normalizeText(product.description);

        const matchesSearch =
            !searchText ||
            productName.includes(searchText) ||
            productLocation.includes(searchText) ||
            productDescription.includes(searchText);

        const productCategory = normalizeCategory(product.category);

        const matchesCategory =
            !selectedCategory ||
            selectedCategory === "all" ||
            productCategory === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

// تشغيل البحث عند الكتابة
if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
}

// تشغيل التصفية عند اختيار التصنيف
if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts);
}

// تحميل المنتجات عند فتح الصفحة
loadProducts();
