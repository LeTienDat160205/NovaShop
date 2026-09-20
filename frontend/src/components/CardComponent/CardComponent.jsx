import { Meta } from "antd/es/list/Item";
import React from "react";
import { Card } from "antd";
import { StyleNameProduct, WrapperCardStyle, WrapperDiscountText, WrapperPriceText, WrapperReportText } from "./style";
import { StarFilled } from "@ant-design/icons";

const CardComponent = () => {
  return (
    <WrapperCardStyle
      hoverable
      headStyle={{width: '200px', height: '200px'}}
      variant="borderless"
      style={{ width: 200 }}
      bodyStyle={{ padding: "10px" }}
      cover={
        <img
          draggable={false}
          alt="example"
          src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
        />
      }
    >
      <StyleNameProduct>Iphone</StyleNameProduct>
      <WrapperReportText>
        <span style={{marginRight: '4px'}}>
          <span>4.96</span>
          <StarFilled style={{ fontSize: "12px", color: "orange" }} />
        </span>
        <span>| Đã bán 987+</span>
      </WrapperReportText>
      <WrapperPriceText>
        3.600.000đ 
        <WrapperDiscountText>-20%</WrapperDiscountText>
      </WrapperPriceText>
    </WrapperCardStyle>
  );
};

export default CardComponent;
