import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as ProductService from "../../services/ProductService";
import CardComponent from "../../components/CardComponent/CardComponent";
import NavbarComponent from "../../components/NavbarComponent/NavbarComponent";
import { Row, Pagination, Col } from "antd";
import { WrapperProducts, WrapperNavbar } from "./style";
import { mockProducts } from "../../data/mockProducts";

const TypeProductPage = () => {
  // const { type } = useParams();
  // const onChange = () => {};
  // const products = type
  //   ? mockProducts.filter((product) => product.type === type)
  //   : mockProducts;
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const response = await ProductService.getAllProduct();

        if (response?.status === "OK") {
          const allProducts = response.data || [];

          const filteredProducts = type
            ? allProducts.filter((product) =>
                product.categoryPath?.some(
                  (category) =>
                    String(category).toLowerCase() ===
                    decodeURIComponent(type).toLowerCase(),
                ),
              )
            : allProducts;

          setProducts(filteredProducts);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);
  return (
    <div style={{ padding: "0 120px", background: "#efefef" }}>
      <Row
        style={{
          flexWrap: "nowrap",
          paddingTop: "10px",
        }}
      >
        <WrapperNavbar span={4}>
          <NavbarComponent />
        </WrapperNavbar>
        <Col span={20}>
          {/* <WrapperProducts>
            {products.map((product) => (
              <CardComponent key={product.id} product={product} />
            ))}
          </WrapperProducts> */}
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              Đang tải sản phẩm...
            </div>
          ) : (
            <WrapperProducts>
              {products.map((product) => (
                <CardComponent key={product._id} product={product} />
              ))}
            </WrapperProducts>
          )}
          <Pagination
            defaultCurrent={2}
            total={100}
            onChange={onChange}
            style={{
              textAlign: "center",
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default TypeProductPage;
