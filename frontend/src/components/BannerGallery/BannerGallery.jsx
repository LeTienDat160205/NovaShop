import SliderModule from 'react-slick';
import styled from 'styled-components';

const Slider = SliderModule.default;

const BannerCarousel = styled.section`
  margin: ${({ $flushTop }) => ($flushTop ? '0 0 24px' : '24px 0')};
  padding-bottom: 20px;

  .slick-list {
    overflow: hidden;
    border: 1px solid #e6e6eb;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 3px 12px rgba(30, 40, 60, 0.05);
  }

  .slick-dots {
    bottom: -20px;
  }

  .slick-dots li button:before {
    color: #0b74e5;
    font-size: 9px;
  }

  .slick-prev,
  .slick-next {
    z-index: 1;
    width: 36px;
    height: 36px;
  }

  .slick-prev {
    left: 12px;
  }

  .slick-next {
    right: 12px;
  }

  .slick-prev:before,
  .slick-next:before {
    color: #fff;
    font-size: 32px;
    opacity: 0.9;
  }

  @media (max-width: 600px) {
    margin: ${({ $flushTop }) => ($flushTop ? '0 0 16px' : '16px 0')};
  }
`;

const BannerFrame = styled.div`
  aspect-ratio: 3.2 / 1;
`;

const BannerImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BannerGallery = ({ images, label, flushTop = false }) => {
  const settings = {
    accessibility: true,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3500,
    dots: true,
    infinite: images.length > 1,
    pauseOnHover: true,
    pauseOnFocus: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
  };

  return (
    <BannerCarousel $flushTop={flushTop} aria-label={label}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <BannerFrame key={image}>
            <BannerImage
              src={image}
              alt={`${label} ${index + 1}`}
            />
          </BannerFrame>
        ))}
      </Slider>
    </BannerCarousel>
  );
};

export default BannerGallery;
