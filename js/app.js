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

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const wilayaFilter = document.getElementById("wilayaFilter");
const filterButton = document.getElementById("filterButton");
const statusMessage = document.getElementById("statusMessage");

function displayProducts(list) {
if (!productsGrid) return;

productsGrid.innerHTML = "";

if (list.length === 0) {
    productsGrid.innerHTML =
        '<p class="empty-message">لا توجد منتجات تطابق بحثك حالياً.</p>';
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

    const name = document.createElement("h3");
    name.textContent = product.name || "منتج فلاحي";

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent =
        `${Number(product.price || 0).toLocaleString("ar-DZ")} دج / ${product.unit || "وحدة"}`;

    const location = document.createElement("p");
    location.className = "product-location";
    location.textContent = `📍 ${product.wilaya || "غير محدد"}`;

    info.append(name, price, location);
    card.append(image, info);
    productsGrid.appendChild(card);
});

}

function filterProducts() {
const search = searchInput ? searchInput.value.trim().toLowerCase() : "";
const category = categoryFilter ? categoryFilter.value : "";
const wilaya = wilayaFilter ? wilayaFilter.value : "";

const filtered = products.filter(product => {
    const matchesName = (product.name || "").toLowerCase().includes(search);
    const matchesCategory = !category || product.category === category;
    const matchesWilaya = !wilaya || product.wilaya === wilaya;

    return matchesName && matchesCategory && matchesWilaya;
});

displayProducts(filtered);

if (statusMessage) {
    statusMessage.textContent =
        `عدد المنتجات المعروضة: ${filtered.length}`;
}

}

if (filterButton) {
filterButton.addEventListener("click", filterProducts);
}

if (searchInput) {
searchInput.addEventListener("input", filterProducts);
}

if (categoryFilter) {
categoryFilter.addEventListener("change", filterProducts);
}

if (wilayaFilter) {
wilayaFilter.addEventListener("change", filterProducts);
}

displayProducts(products);
