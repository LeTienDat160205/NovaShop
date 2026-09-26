import { SearchOutlined } from "@ant-design/icons";
import React from "react";
import InputComponent from "../InputComponent/InputComponent";
import ButtonComponent from "../ButtonComponent/ButtonComponent";

const ButtonInputSearch = (props) => {
  const {
    size,
    placeholder,
    textButton,
    bordered,
    backgroundColorInput = '#fff',
    backgroundColorButton = 'rgb(13, 92, 182)',
    colorButton = '#fff',
    borderRadius = 0,
  } = props;
  return (
    <div style={{ display: "flex", backgroundColor: "#fff"}}>
      <InputComponent
        size={size}
        placeholder={placeholder}
        bordered={bordered}
        style={{ backgroundColor: backgroundColorInput , borderRadius: borderRadius}}
      />
      <ButtonComponent
        size={size}
        // bordered={bordered}
        styleButton={{ backgroundColor: backgroundColorButton , borderRadius: borderRadius, color: colorButton, border: !bordered && 'none'}}
        icon={<SearchOutlined color={colorButton} style={{color: '#fff'}}/>}
        textButton={textButton}
        styleTextButton={{color: colorButton}}
      />
        
      
    </div>
  );
};

export default ButtonInputSearch;
