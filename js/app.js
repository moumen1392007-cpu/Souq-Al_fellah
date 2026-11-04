import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusMessage = document.getElementById("statusMessage");

let products = [];

function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه");
}

function normalizeCategory(category) {
    const value = normalize(category);

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

async function loadProducts() {
    productsGrid.innerHTML =
        '<p class="empty-message">جارٍ تحميل الأسعار...</p>';

    try {
        let snapshot;

        try {
            snapshot = await getDocs(
                query(collection(db, "products"), orderBy("createdAt", "desc"))
            );
        } catch (error) {
            snapshot = await getDocs(collection(db, "products"));
        }

        products = snapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));

        displayProducts(products);

    } catch (error) {
        console.error(error);

        productsGrid.innerHTML =
            '<p class="empty-message">تعذر تحميل الأسعار. حاول مجدداً.</p>';
    }
}

function displayProducts(list) {
    productsGrid.innerHTML = "";

    if (list.length === 0) {
        productsGrid.innerHTML =
            '<p class="empty-message">لا توجد أسعار منشورة حالياً.</p>';
        return;
    }

    list.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("img");
        image.src = product.image || product.imageUrl ||
            "https://placehold.co/600x400?text=Product";
        image.alt = product.name || "منتج";
        image.loading = "lazy";

        image.onerror = () => {
            image.src = "https://placehold.co/600x400?text=No+Image";
        };

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name || "منتج";

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent =
            `${Number(product.price || 0).toLocaleString("ar-DZ")} دج / ${product.unit || "كغ"}`;

        const location = document.createElement("p");
        location.className = "product-location";
        location.textContent = "📍 " + (product.wilaya || "ولاية غير محددة");

        const seller = document.createElement("p");
        seller.className = "product-location";
        seller.textContent = "🌾 " + (product.sellerName || "بائع");

        info.append(name, price, location, seller);
        card.append(image, info);
        productsGrid.appendChild(card);
    });

    if (statusMessage) {
        statusMessage.textContent = `عدد الأسعار المنشورة: ${list.length}`;
    }
}

function filterProducts() {
    const search = normalize(searchInput?.value || "");
    const category = normalizeCategory(categoryFilter?.value || "");

    const filtered = products.filter(product => {
        const name = normalize(product.name);
        const productCategory = normalizeCategory(product.category);
        const wilaya = normalize(product.wilaya);

        return (
            (!search ||
                name.includes(search) ||
                productCategory.includes(search) ||
                wilaya.includes(search)) &&
            (!category || category === "all" ||
                productCategory === category)
        );
    });

    displayProducts(filtered);
}

searchInput?.addEventListener("input", filterProducts);
categoryFilter?.addEventListener("change", filterProducts);

window.filterProducts = filterProducts;

loadProducts();
