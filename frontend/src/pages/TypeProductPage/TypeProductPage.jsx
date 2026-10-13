import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import * as ProductService from "../../services/ProductService";
import CardComponent from "../../components/CardComponent/CardComponent";
import NavbarComponent from "../../components/NavbarComponent/NavbarComponent";
import { Row, Col } from "antd";
import { WrapperProducts, WrapperNavbar } from "./style";
import {
  CATEGORY_LIST,
  getDbKeywordBySlug,
  getBrandsByCategoryKeyword,
} from "../../utils/categoryConfig";

const TypeProductPage = () => {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("search") || ""; // Lấy từ khóa từ URL
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    brand: "",
    rating: "",
    minPrice: null,
    maxPrice: null,
  });

  const isAll = type === "all";
  const currentCategory = CATEGORY_LIST.find((c) => c.slug === type);
  const displayName = isAll ? "Tất cả sản phẩm" : (currentCategory ? currentCategory.name : type);
  const keyword = isAll ? "all" : getDbKeywordBySlug(type);

  // Lấy danh sách thương hiệu của category hiện tại
  const availableBrands = useMemo(() => {
    return getBrandsByCategoryKeyword(isAll ? "" : keyword);
  }, [keyword, isAll]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      name: "",
      brand: "",
      rating: "",
      minPrice: null,
      maxPrice: null,
    });
  };

  // Reset filter khi đổi category hoặc đổi từ khóa tìm kiếm
  useEffect(() => {
    handleResetFilters();
  }, [type, searchKeyword]);

  // Fetch dữ liệu từ API khi keyword hoặc searchKeyword thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await ProductService.getProductByCategory(keyword, searchKeyword);
        if (res?.status === "OK") {
          setProducts(res.data || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, searchKeyword]);

  // Bộ lọc Client-side (với các filter bên thanh navbar phụ)
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Tên sản phẩm phụ từ navbar (nếu có)
      if (
        filters.name &&
        !item.name?.toLowerCase().includes(filters.name.toLowerCase().trim())
      ) {
        return false;
      }
      // 2. Thương hiệu
      if (
        filters.brand &&
        item.brand?.toLowerCase() !== filters.brand.toLowerCase()
      ) {
        return false;
      }
      // 3. Đánh giá
      if (
        filters.rating &&
        Number(item.rating || 0) < Number(filters.rating)
      ) {
        return false;
      }
      // 4. Khoảng giá
      if (filters.minPrice !== null && item.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && item.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  return (
    <div style={{ padding: "0 120px", background: "#efefef", minHeight: "100vh" }}>
      <Row style={{ flexWrap: "nowrap", paddingTop: "15px", gap: "15px" }}>
        <WrapperNavbar span={5}>
          <NavbarComponent
            brands={availableBrands}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </WrapperNavbar>

        <Col span={19}>
          <div style={{ marginBottom: "15px" }}>
            <h2>{displayName}</h2>
            {searchKeyword && (
              <span style={{ fontSize: "14px", color: "#666" }}>
                Kết quả tìm kiếm cho: <strong style={{ color: "#0b74e5" }}>"{searchKeyword}"</strong>
              </span>
            )}
          </div>

          {loading ? (
            <div>Đang tải sản phẩm...</div>
          ) : filteredProducts.length === 0 ? (
            <div>Không có sản phẩm nào phù hợp.</div>
          ) : (
            <WrapperProducts>
              {filteredProducts.map((product) => (
                <CardComponent
                  key={product._id || product.item_id}
                  product={product}
                  onClick={() =>
                    navigate(`/product-details/${product._id || product.item_id}`)
                  }
                />
              ))}
            </WrapperProducts>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TypeProductPage;