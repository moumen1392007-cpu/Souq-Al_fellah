import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

// عناصر الصفحة
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const wilayaFilter = document.getElementById("wilayaFilter");
const statusMessage = document.getElementById("statusMessage");

let products = [];

// توحيد النصوص العربية
function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, " ");
}

// توحيد التصنيفات
function normalizeCategory(category) {
    const value = normalizeText(category);

    const categories = {
        "خضر": "vegetables",
        "الخضر": "vegetables",
        "vegetables": "vegetables",
        "فواكه": "fruits",
        "الفواكه": "fruits",
        "fruits": "fruits",
        "حبوب": "grains",
        "الحبوب": "grains",
        "grains": "grains",
        "اخرى": "other",
        "other": "other"
    };

    return categories[value] || value;
}

// جلب المنتجات من Firebase
async function loadProducts() {
    if (!productsGrid) return;

    productsGrid.innerHTML =
        '<p class="empty-message">جارٍ تحميل المنتجات...</p>';

    try {
        const productsQuery = query(
            collection(db, "products"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(productsQuery);

        products = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }));

        displayProducts(products);

        if (statusMessage) {
            statusMessage.textContent =
                `عدد المنتجات: ${products.length}`;
        }

    } catch (error) {
        console.error("Firebase error:", error);

        // محاولة ثانية دون ترتيب إذا لم يوجد createdAt
        try {
            const snapshot = await getDocs(
                collection(db, "products")
            );

            products = snapshot.docs.map(document => ({
                id: document.id,
                ...document.data()
            }));

            displayProducts(products);

        } catch (secondError) {
            console.error(secondError);

            productsGrid.innerHTML =
                '<p class="empty-message">تعذر تحميل المنتجات. تحقق من الاتصال بقاعدة البيانات.</p>';
        }
    }
}

// عرض المنتجات
function displayProducts(list) {
    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    if (!list.length) {
        productsGrid.innerHTML =
            '<p class="empty-message">لا توجد منتجات حالياً.</p>';
        return;
    }

    list.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("img");

        image.src = product.image || product.imageUrl ||
            "https://placehold.co/600x400?text=Souq+Alfellah";

        image.alt = product.name || "منتج";
        image.loading = "lazy";

        image.onerror = function () {
            this.src = "https://placehold.co/600x400?text=No+Image";
        };

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name || "منتج بدون اسم";

        const price = document.createElement("p");
        price.className = "product-price";

        const priceValue = Number(product.price) || 0;
        const unit = product.unit || "كغ";

        price.textContent =
            `${priceValue.toLocaleString("ar-DZ")} دج / ${unit}`;

        const location = document.createElement("p");
        location.className = "product-location";

        location.textContent =
            "📍 " + (product.wilaya || "غير محددة");

        info.append(name, price, location);
        card.append(image, info);

        productsGrid.appendChild(card);
    });
}

// البحث والتصفية
function filterProducts() {
    const search = normalizeText(
        searchInput?.value || ""
    );

    const selectedCategory = normalizeCategory(
        categoryFilter?.value || ""
    );

    const selectedWilaya = wilayaFilter?.value || "";

    const filtered = products.filter(product => {
        const name = normalizeText(product.name);
        const category = normalizeCategory(product.category);
        const wilaya = normalizeText(product.wilaya);

        const matchesSearch =
            !search ||
            name.includes(search) ||
            category.includes(search) ||
            wilaya.includes(search);

        const matchesCategory =
            !selectedCategory ||
            selectedCategory === "all" ||
            category === selectedCategory;

        const matchesWilaya =
            !selectedWilaya ||
            product.wilaya === selectedWilaya;

        return matchesSearch &&
            matchesCategory &&
            matchesWilaya;
    });

    displayProducts(filtered);

    if (statusMessage) {
        statusMessage.textContent =
            `عدد المنتجات المعروضة: ${filtered.length}`;
    }
}

// ربط البحث
if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
}

// ربط التصنيفات
if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts);
}

// ربط الولايات
if (wilayaFilter) {
    wilayaFilter.addEventListener("change", filterProducts);
}

// زر البحث
const filterButton = document.querySelector(".search-box button");

if (filterButton) {
    filterButton.addEventListener("click", filterProducts);
}

// أزرار التصنيفات
document.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;

        if (categoryFilter) {
            categoryFilter.value = category;
        }

        filterProducts();
    });
});

// إتاحة البحث لملف HTML
window.filterProducts = filterProducts;

// تحميل المنتجات
loadProducts();
