import React from "react";
import CardComponent from "../../components/CardComponent/CardComponent";
import NavbarComponent from "../../components/NavbarComponent/NavbarComponent";
import { Row, Pagination, Col } from "antd";
import { WrapperProducts, WrapperNavbar } from "./style";
import { mockProducts } from "../../data/mockProducts";
import { useParams } from "react-router-dom";

const TypeProductPage = () => {
  const { type } = useParams();
  const onChange = () => {};
  const products = type
    ? mockProducts.filter((product) => product.type === type)
    : mockProducts;
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
          <WrapperProducts>
            {products.map((product) => (
              <CardComponent key={product.id} product={product} />
            ))}
          </WrapperProducts>
          <Pagination
            defaultCurrent={2}
            total={100}
            onChange={onChange}
            style={{textAlign: 'center', marginTop: '10px', display: "flex", justifyContent: "center",}}
          />
        </Col>
      </Row>
    </div>
  );
};

export default TypeProductPage;
