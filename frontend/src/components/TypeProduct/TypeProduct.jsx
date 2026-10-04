import React from "react";
import { WrapperTypeProduct } from "./style";

const TypeProduct = ({ name, onClick }) => {
  return (
    <WrapperTypeProduct onClick={onClick}>
      {name}
    </WrapperTypeProduct>
  );
};

export default TypeProduct;