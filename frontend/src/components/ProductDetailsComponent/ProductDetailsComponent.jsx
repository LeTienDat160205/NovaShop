import { Col, Flex, Image, Row } from "antd";
import React from "react";
import imageProduct from "../../assets/images/test.webp";
import imageSmall from "../../assets/images/imagesmall.webp";
import {
  WrapperStyleImageSmall,
  WrapperStyleColImage,
  WrapperStyleNameProduct,
  WrapperStyleTextSell,
  WrapperPriceProduct,
  WrapperPriceTextProduct,
  WrapperAddressProduct,
  WrapperQualityProduct,
  WrapperInputNumber,
} from "./style";
import { MinusOutlined, PlusOutlined, StarFilled } from "@ant-design/icons";
import ButtonComponent from "../ButtonComponent/ButtonComponent";

const ProductDetailsComponent = () => {
  const onChange = () => {};
  return (
    <Row style={{ padding: "16px", background: "#fff" , borderRadius: '4px'}}>
      <Col span={10} style={{borderRight: '1px solid #e5e5e5', paddingRight: '8px'}}>
        <Image src={imageProduct} alt="image product" preview={false} />
        <Row style={{ paddingTop: "10px", justifyContent: "space-between" }}>
          <WrapperStyleColImage span={4}>
            <WrapperStyleImageSmall
              src={imageSmall}
              alt="image small"
              preview={false}
            />
          </WrapperStyleColImage>
          <WrapperStyleColImage span={4}>
            <WrapperStyleImageSmall
              src={imageSmall}
              alt="image small"
              preview={false}
            />
          </WrapperStyleColImage>
          <WrapperStyleColImage span={4}>
            <WrapperStyleImageSmall
              src={imageSmall}
              alt="image small"
              preview={false}
            />
          </WrapperStyleColImage>
          <WrapperStyleColImage span={4}>
            <WrapperStyleImageSmall
              src={imageSmall}
              alt="image small"
              preview={false}
            />
          </WrapperStyleColImage>
          <WrapperStyleColImage span={4}>
            <WrapperStyleImageSmall
              src={imageSmall}
              alt="image small"
              preview={false}
            />
          </WrapperStyleColImage>
          <WrapperStyleColImage span={4}>
            <WrapperStyleImageSmall
              src={imageSmall}
              alt="image small"
              preview={false}
            />
          </WrapperStyleColImage>
        </Row>
      </Col>
      <Col span={14} style={{paddingLeft: '12px'}}>
        <WrapperStyleNameProduct>
          Sách Thám tử lừng danh Conan trọn bộ bản đặc biệt kỉ niệm 20 năm
        </WrapperStyleNameProduct>
        <div>
          <StarFilled style={{ fontSize: "12px", color: "orange" }} />
          <StarFilled style={{ fontSize: "12px", color: "orange" }} />
          <StarFilled style={{ fontSize: "12px", color: "orange" }} />
          <StarFilled style={{ fontSize: "12px", color: "orange" }} />
          <WrapperStyleTextSell>| Đã bán 300+ </WrapperStyleTextSell>
        </div>
        <WrapperPriceProduct>
          <WrapperPriceTextProduct>200.000 đ</WrapperPriceTextProduct>
        </WrapperPriceProduct>
        <WrapperAddressProduct>
          <span>Giao đến </span>
          <span className="address">Đại học Công nghiệp Hà Nội</span>
          <span className="change-address"> - Đổi địa chỉ</span>
        </WrapperAddressProduct>
        <div style={{margin: '10px 0 20px',padding: '10px 0', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5'}}>
          <div style={{marginBottom: '12px'}}>Số lượng</div>
          <WrapperQualityProduct>
            <button style={{border: 'none', background: 'transparent'}}>
                <MinusOutlined style={{ color: "#000", fontSize: "20px" }} size="10"/>
            </button>
            

            <WrapperInputNumber defaultValue={3} onChange={onChange} size="small"/>

            <button style={{border: 'none', background: 'transparent'}}>
                <PlusOutlined style={{ color: "#000", fontSize: "20px" }} size="10"/>
            </button>
          </WrapperQualityProduct>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <ButtonComponent 
                bordered={false}
                size={40}
                styleButton={{ 
                    backgroundColor: 'rgb(255, 57, 69)',
                    height: '48px',
                    width: '220px',
                    border: 'none',
                    borderRadius: '4px'
                }}
                textButton={'Chọn mua'}
                styleTextButton={{color: '#fff', fontSize: '15px', fontWeight: '700'}}
            ></ButtonComponent>

            <ButtonComponent 
                size={40}
                styleButton={{ 
                    backgroundColor: '#fff',
                    height: '48px',
                    width: '220px',
                    border: '1px solid rgb(13, 92, 182)',
                    borderRadius: '4px'
                }}
                textButton={'Mua trả sau'}
                styleTextButton={{color: 'rgb(13, 92, 182)', fontSize: '15px'}}
            ></ButtonComponent>
        </div>
      </Col>
    </Row>
  );
};

export default ProductDetailsComponent;
