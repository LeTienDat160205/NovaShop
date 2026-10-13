import React, { useEffect, useState } from "react";
import TypeProduct from "../../components/TypeProduct/TypeProduct";
import {
  WrapperTypeProduct,
  WrapperButtonMore,
  WrapperProducts,
} from "./style";
import SliderComponent from "../../components/SliderComponent/SliderComponent";
import slider1 from "../../assets/images/slider1.webp";
import slider2 from "../../assets/images/slider2.webp";
import slider3 from "../../assets/images/slider3.webp";
import CardComponent from "../../components/CardComponent/CardComponent";
import * as ProductService from "../../services/ProductService";
import { useNavigate } from "react-router-dom";
import { CATEGORY_LIST } from "../../utils/categoryConfig";

const HomePage = () => {
  const navigate = useNavigate();

  const openCategory = (slug) => {
    navigate(`/products/${slug}`);
  };

  const openProduct = (id) => {
    navigate(`/product-details/${id}`);
  };

  const [products, setProducts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Mỗi lần tải 18 sản phẩm, tương ứng 3 hàng nếu mỗi hàng có 6 sản phẩm
  const ITEMS_PER_PAGE = 18;

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);


  // Tải sản phẩm theo từng trang
  const fetchProducts = async (pageNumber = 1) => {
    if (pageNumber === 1) {
      setInitialLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await ProductService.getAllProduct(
        pageNumber,
        ITEMS_PER_PAGE
      );

      if (res?.status === "OK") {
        const newProducts = res.data || [];

        if (pageNumber === 1) {
          // Lần đầu chỉ hiển thị 18 sản phẩm
          setProducts(newProducts);
        } else {
          // Khi xem thêm, nối sản phẩm mới vào danh sách hiện tại
          setProducts((prevProducts) => {
            const existingIds = new Set(
              prevProducts.map((product) => product._id)
            );

            const uniqueProducts = newProducts.filter(
              (product) => !existingIds.has(product._id)
            );

            return [...prevProducts, ...uniqueProducts];
          });
        }

        setPage(pageNumber);

        // Nếu trang vừa tải có ít hơn 18 sản phẩm thì đã hết dữ liệu
        setHasMore(newProducts.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Tải thêm 18 sản phẩm khi người dùng nhấn nút
  const handleLoadMore = () => {
    if (!initialLoading && !loadingMore && hasMore) {
      fetchProducts(page + 1);
    }
  };

  return (
    <>
      {/* Danh mục sản phẩm */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #ebebf0",
          width: "100%",
        }}
      >
        <div
          style={{
            padding: "0 120px",
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
          }}
        >
          {CATEGORY_LIST.map((item) => (
            <TypeProduct
              name={item.name}
              key={item.slug}
              onClick={() => openCategory(item.slug)}
            />
          ))}
        </div>
      </div>

      {/* Nội dung trang chủ */}
      <div
        id="container"
        style={{
          backgroundColor: "#efefef",
          padding: "0 120px",
          minHeight: "1000px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Banner */}
        <SliderComponent arrImages={[slider1, slider2, slider3]} />

        {/* Danh sách sản phẩm */}
        {initialLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px 0",
            }}
          >
            Đang tải sản phẩm...
          </div>
        ) : products.length > 0 ? (
          <WrapperProducts>
            {products.map((product) => (
              <CardComponent
                key={product._id}
                product={product}
                onClick={() => openProduct(product._id)}
              />
            ))}
          </WrapperProducts>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "30px 0",
            }}
          >
            Không có sản phẩm để hiển thị.
          </div>
        )}

        {/* Nút xem thêm */}
        {hasMore && !initialLoading && products.length > 0 && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
              paddingBottom: "20px",
            }}
          >
            <WrapperButtonMore
              textButton={loadingMore ? "Đang tải..." : "Xem thêm"}
              type="default"
              onClick={handleLoadMore}
              styleButton={{
                border: "1px solid rgb(11, 116, 229)",
                color: "rgb(11, 116, 229)",
                width: "240px",
                height: "38px",
                borderRadius: "4px",
                cursor: loadingMore ? "not-allowed" : "pointer",
                opacity: loadingMore ? 0.6 : 1,
              }}
              styleTextButton={{
                fontWeight: 500,
              }}
            />
          </div>
        )}

        {/* Thông báo khi đã tải hết sản phẩm */}
        {!hasMore && !initialLoading && products.length > 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              color: "#666",
            }}
          >
            Bạn đã xem hết sản phẩm.
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;