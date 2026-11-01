import SliderModule from 'react-slick';
import styled from 'styled-components';
import CardComponent from '../CardComponent/CardComponent';

const Slider = SliderModule.default;

const Carousel = styled.div`
  padding-bottom: ${({ $multiplePages }) => ($multiplePages ? '20px' : '0')};

  .slick-list {
    margin: 0 -10px;
  }

  .slick-slide > div {
    padding: 0 10px 16px;
  }

  .slick-slide {
    height: auto;
  }

  .slick-dots {
    bottom: -16px;
  }

  .slick-dots li button:before {
    color: #0b74e5;
    font-size: 9px;
  }

  .slick-prev,
  .slick-next {
    z-index: 1;
    width: 32px;
    height: 32px;
  }

  .slick-prev {
    left: 10px;
  }

  .slick-next {
    right: 10px;
  }

  .slick-prev:before,
  .slick-next:before {
    color: #0b74e5;
    font-size: 28px;
    opacity: 0.9;
  }
`;

const ProductCarousel = ({ products, label }) => {
  const multiplePages = products.length > 5;
  const settings = {
    accessibility: true,
    arrows: multiplePages,
    autoplay: multiplePages,
    autoplaySpeed: 3500,
    dots: multiplePages,
    infinite: multiplePages,
    pauseOnHover: true,
    pauseOnFocus: true,
    rows: 1,
    slidesPerRow: 1,
    slidesToShow: 5,
    slidesToScroll: 5,
    speed: 500,
    responsive: [
      {
        breakpoint: 1100,
        settings: { slidesToShow: 4, slidesToScroll: 4 },
      },
      {
        breakpoint: 800,
        settings: { slidesToShow: 3, slidesToScroll: 3 },
      },
      {
        breakpoint: 560,
        settings: { slidesToShow: 2, slidesToScroll: 2 },
      },
    ],
  };

  return (
    <Carousel $multiplePages={multiplePages} aria-label={label}>
      <Slider {...settings}>
        {products.map(product => (
          <CardComponent key={product._id} product={product} />
        ))}
      </Slider>
    </Carousel>
  );
};

export default ProductCarousel;
