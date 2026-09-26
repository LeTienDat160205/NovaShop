import productImage from "../assets/images/test.webp";

export const mockProducts = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  name: `Sách Thám tử lừng danh Conan - Tập ${index + 1}`,
  image: productImage,
  rating: "4.9",
  sold: `${120 + index * 17}+`,
  price: "200.000 ₫",
  discount: "-20%",
  type: index % 2 === 0 ? "sach" : "truyen",
}));
