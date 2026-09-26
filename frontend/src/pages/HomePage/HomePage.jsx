import React from "react";
import TypeProduct from "../../components/TypeProduct/TypeProduct";
import { WrapperTypeProduct, WrapperButtonMore, WrapperProducts } from "./style";
import SliderComponent from "../../components/SliderComponent/SliderComponent";
import slider1 from "../../assets/images/slider1.webp";
import slider2 from "../../assets/images/slider2.webp";
import slider3 from "../../assets/images/slider3.webp";
import CardComponent from "../../components/CardComponent/CardComponent";
import NavbarComponent from "../../components/NavbarComponent/NavbarComponent";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

const products = [
  {
    name: "iPhone 15 Pro Max 256GB",
    price: "28.990.000đ",
    discount: "-12%",
    rating: "4.9",
    sold: "1.2k",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "MacBook Air M3 13 inch",
    price: "25.490.000đ",
    discount: "-10%",
    rating: "4.8",
    sold: "856",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Tai nghe AirPods Pro 2",
    price: "5.490.000đ",
    discount: "-18%",
    rating: "4.9",
    sold: "2.3k",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Apple Watch Series 10",
    price: "10.990.000đ",
    discount: "-15%",
    rating: "4.8",
    sold: "728",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Bàn phím cơ Keychron K2",
    price: "2.190.000đ",
    discount: "-20%",
    rating: "4.7",
    sold: "645",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Loa Bluetooth Marshall",
    price: "3.290.000đ",
    discount: "-14%",
    rating: "4.9",
    sold: "534",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
  },
];

const HomePage = () => {
  const arr = [
    "Điện thoại",
    "Laptop",
    "Máy tính bảng",
    "Tai nghe",
    "Đồng hồ thông minh",
    "Thiết bị gia dụng",
    "Thời trang",
  ];
  return (
    <>
      <div style={{ padding: "0 120px" }}>
        <WrapperTypeProduct>
          {arr.map((item) => {
            return <TypeProduct name={item} key={item} />;
          })}
        </WrapperTypeProduct>
      </div>
      <div
        id="container"
        style={{
          backgroundColor: "#efefef",
          padding: "0 120px",
          height: "1000px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <SliderComponent arrImages={[slider1, slider2, slider3]} />
        <WrapperProducts>
          {products.map((product) => (
            <CardComponent key={product.name} product={product} />
          ))}
        </WrapperProducts>
        <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
          <WrapperButtonMore
            textButton="Xem thêm"
            type="default"
            styleButton={{
              border: "1px solid rgb(11, 116, 229)",
              color: "rgb(11, 116, 229)",
              width: "240px",
              height: "30px",
              borderRadius: "4px",
            }}
            styleTextButton={{ fontWeight: 500 }}
          />
        </div>
      </div>
    </>
  );
};

export default HomePage;
