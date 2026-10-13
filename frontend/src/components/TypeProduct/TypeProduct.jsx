import React from "react";
import { WrapperTypeProduct } from "./style";

const TypeProduct = ({ name, onClick }) => {
  return (
    <WrapperTypeProduct onClick={onClick} style={{ cursor: "pointer", userSelect: "none" }}>
      {name}
    </WrapperTypeProduct>
  );
};

export default TypeProduct;