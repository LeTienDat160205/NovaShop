
import productsData from "../data/products.json";

export const CATEGORY_LIST = [
  {
    name: "Tai nghe",
    slug: "earphone",
    dbKeyword: "Tai Nghe",
  },
  {
    name: "Chuột & Bàn phím",
    slug: "mouse-keyboard",
    dbKeyword: "Chuột|Bàn Phím|Phím Chuột",
  },
  {
    name: "Pin sạc & Cáp",
    slug: "accessories",
    dbKeyword: "Pin Sạc|Dây Cáp|Adapter|Củ Sạc|Dây Sạc",
  },
  {
    name: "Đồng hồ thông minh",
    slug: "smartwatch",
    dbKeyword: "Đồng Hồ|Vòng Đeo|Vòng Tay",
  },
  {
    name: "Loa",
    slug: "speaker",
    dbKeyword: "Loa",
  },
  {
    name: "Phụ kiện máy tính",
    slug: "laptop-accessories",
    dbKeyword: "Phụ Kiện|Lót Chuột|Vệ Sinh",
  },
];

export const getDbKeywordBySlug = (slug) => {
  const item = CATEGORY_LIST.find((c) => c.slug?.toLowerCase() === String(slug).toLowerCase());
  return item ? item.dbKeyword : slug;
};

export const getAllBrands = () => {
  const brandList = (productsData || [])
    .map((p) => p.brand?.trim())
    .filter((brand) => brand && brand.toLowerCase() !== "oem");
  return Array.from(new Set(brandList)).sort();
};

export const getBrandsByCategoryKeyword = (keyword) => {
  if (!keyword) return getAllBrands();
  const regex = new RegExp(keyword, "i");

  const filtered = (productsData || []).filter((p) => {
    return regex.test(p.group || "") || regex.test(p.name || "");
  });

  const brands = filtered
    .map((p) => p.brand?.trim())
    .filter((brand) => brand && brand.toLowerCase() !== "oem");

  return Array.from(new Set(brands)).sort();
};