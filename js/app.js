// المنتجات التجريبية
const products = [
    {
        name: "طماطم طازجة",
        category: "vegetables",
        price: 120,
        unit: "كغ",
        wilaya: "الجزائر",
        image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600"
    },
    {
        name: "بطاطا ممتازة",
        category: "vegetables",
        price: 85,
        unit: "كغ",
        wilaya: "تيبازة",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600"
    },
    {
        name: "تفاح أحمر",
        category: "fruits",
        price: 250,
        unit: "كغ",
        wilaya: "البليدة",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600"
    },
    {
        name: "برتقال",
        category: "fruits",
        price: 180,
        unit: "كغ",
        wilaya: "مستغانم",
        image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=600"
    },
    {
        name: "فلفل أخضر",
        category: "vegetables",
        price: 150,
        unit: "كغ",
        wilaya: "معسكر",
        image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600"
    },
    {
        name: "عسل طبيعي",
        category: "other",
        price: 1800,
        unit: "لتر",
        wilaya: "باتنة",
        image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600"
    }
];

// عناصر الصفحة
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const wilayaFilter = document.getElementById("wilayaFilter");
const statusMessage = document.getElementById("statusMessage");

// توحيد النصوص العربية
function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, " ");
}

// ترجمة التصنيفات
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
        "أخرى": "other",
        "other": "other"
    };

    return categories[value] || value;
}

// عرض المنتجات
function displayProducts(list) {

    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    if (list.length === 0) {
        productsGrid.innerHTML =
            '<p class="empty-message">لم يتم العثور على منتجات مطابقة للبحث.</p>';
        return;
    }

    list.forEach(product => {

        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent =
            `${product.price.toLocaleString("ar-DZ")} دج / ${product.unit}`;

        const location = document.createElement("p");
        location.className = "product-location";
        location.textContent = "📍 " + product.wilaya;

        info.append(name, price, location);
        card.append(image, info);

        productsGrid.appendChild(card);
    });
}

// البحث والتصفية
function filterProducts() {

    const search = normalizeText(
        searchInput ? searchInput.value : ""
    );

    const selectedCategory = normalizeCategory(
        categoryFilter ? categoryFilter.value : ""
    );

    const selectedWilaya = wilayaFilter
        ? wilayaFilter.value
        : "";

    const filtered = products.filter(product => {

        const productName = normalizeText(product.name);
        const productCategory = normalizeCategory(product.category);
        const productWilaya = normalizeText(product.wilaya);

        const matchesSearch =
            !search ||
            productName.includes(search) ||
            productCategory.includes(search) ||
            productWilaya.includes(search);

        const matchesCategory =
            !selectedCategory ||
            selectedCategory === "all" ||
            productCategory === selectedCategory;

        const matchesWilaya =
            !selectedWilaya ||
            product.wilaya === selectedWilaya;

        return matchesSearch && matchesCategory && matchesWilaya;
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

// إتاحة الدالة للزر الموجود في HTML
window.filterProducts = filterProducts;

// عرض المنتجات عند فتح الصفحة
displayProducts(products);
