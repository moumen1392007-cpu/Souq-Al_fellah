import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusMessage = document.getElementById("statusMessage");

let products = [];

const categories = {
  vegetables: "خضر",
  fruits: "فواكه",
  grains: "حبوب",
  other: "أخرى"
};

// عرض المنتجات
function displayProducts(list) {
  if (!productsGrid) return;

  productsGrid.innerHTML = "";

  if (list.length === 0) {
    productsGrid.innerHTML =
      '<p class="empty-message">لا توجد منتجات حالياً. كن أول من يضيف منتجاً!</p>';
    return;
  }

  list.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.image || "";
    image.alt = product.name || "منتج فلاحي";
    image.loading = "lazy";

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("span");
    category.className = "category";
    category.textContent = categories[product.category] || product.category || "";

    const name = document.createElement("h3");
    name.textContent = product.name || "منتج فلاحي";

    const description = document.createElement("p");
    description.textContent = product.description || "";

    const price = document.createElement("strong");
    price.textContent =
      `${Number(product.price || 0).toLocaleString("ar-DZ")} دج / ${product.unit || "وحدة"}`;

    const location = document.createElement("p");
    location.textContent = `📍 ${product.wilaya || "غير محدد"}`;

    info.append(category, name, description, price, location);
    card.append(image, info);

    productsGrid.appendChild(card);
  });
}

// البحث والتصفية
function filterProducts() {
  const search = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const category = categoryFilter
    ? categoryFilter.value
    : "";

  const filtered = products.filter(product => {
    const matchesName =
      (product.name || "").toLowerCase().includes(search);

    const matchesCategory =
      !category ||
      product.category === category ||
      categories[product.category] === category;

    return matchesName && matchesCategory;
  });

  displayProducts(filtered);

  if (statusMessage) {
    statusMessage.textContent =
      `عدد المنتجات المعروضة: ${filtered.length}`;
  }
}

// جعل الدالة متاحة لزر البحث في HTML
window.filterProducts = filterProducts;

// تحميل المنتجات من Firestore
async function loadProducts() {
  try {
    if (statusMessage) {
      statusMessage.textContent = "جارٍ تحميل المنتجات...";
    }

    const snapshot = await getDocs(
      collection(db, "products")
    );

    products = snapshot.docs.map(document => ({
      id: document.id,
      ...document.data()
    }));

    products.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
    });

    filterProducts();

  } catch (error) {
    console.error("Firebase error:", error);

    if (productsGrid) {
      productsGrid.innerHTML =
        '<p class="empty-message">تعذر تحميل المنتجات. تحقق من الاتصال بقاعدة البيانات.</p>';
    }
  }
}

// تشغيل البحث تلقائياً
if (searchInput) {
  searchInput.addEventListener("input", filterProducts);
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", filterProducts);
}

// بدء التشغيل
loadProducts();
