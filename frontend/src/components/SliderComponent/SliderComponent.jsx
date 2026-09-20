import { Image } from "antd";
import React from "react";
import SliderModule from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Vite trả về module CommonJS của react-slick dưới dạng object.
// Component Slider thực tế nằm trong thuộc tính default của object này.
const Slider = SliderModule.default;

const SliderComponent = ({ arrImages }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000
  };

  return (
    <Slider {...settings}>
      {arrImages.map((image) => (
        <Image
          src={image}
          key={image}
          alt="slider"
          preview={false}
          width="100%"
          height="274px"
        />
      ))}
    </Slider>
  );
};

export default SliderComponent;
