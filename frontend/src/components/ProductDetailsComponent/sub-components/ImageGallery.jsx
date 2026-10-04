import React, { useState } from 'react';
import { LeftOutlined, RightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  StickyBox,
  GalleryContainer,
  GalleryMainImage,
  ThumbnailRow,
  ThumbnailList,
  ThumbnailItem,
  ArrowBtn,
  GalleryHintRow,
} from '../style';

const THUMB_VISIBLE = 5;

const ImageGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);

  const safeImages = images.length > 0 ? images : ['https://via.placeholder.com/400'];
  const mainSrc = safeImages[activeIndex] || safeImages[0];

  const canPrev = thumbStart > 0;
  const canNext = thumbStart + THUMB_VISIBLE < safeImages.length;

  const handlePrev = () => setThumbStart((s) => Math.max(0, s - 1));
  const handleNext = () =>
    setThumbStart((s) => Math.min(safeImages.length - THUMB_VISIBLE, s + 1));

  const visibleThumbs = safeImages.slice(thumbStart, thumbStart + THUMB_VISIBLE);

  return (
    <StickyBox>
      <GalleryContainer>
        {/* Ảnh lớn */}
        <GalleryMainImage>
          <img src={mainSrc} alt="Ảnh sản phẩm" draggable={false} />
        </GalleryMainImage>

        {/* Dãy thumbnail */}
        {safeImages.length > 1 && (
          <ThumbnailRow>
            <ArrowBtn onClick={handlePrev} disabled={!canPrev} aria-label="Thumbnail trước">
              <LeftOutlined />
            </ArrowBtn>

            <ThumbnailList>
              {visibleThumbs.map((src, i) => {
                const realIdx = thumbStart + i;
                return (
                  <ThumbnailItem
                    key={realIdx}
                    $active={activeIndex === realIdx}
                    onClick={() => setActiveIndex(realIdx)}
                  >
                    <img src={src} alt={`Thumbnail ${realIdx + 1}`} draggable={false} />
                  </ThumbnailItem>
                );
              })}
            </ThumbnailList>

            <ArrowBtn onClick={handleNext} disabled={!canNext} aria-label="Thumbnail tiếp">
              <RightOutlined />
            </ArrowBtn>
          </ThumbnailRow>
        )}

        {/* Gợi ý xem ưu điểm */}
        <GalleryHintRow>
          <div className="hint-left">
            <InfoCircleOutlined style={{ color: '#0B74E5', fontSize: 14 }} />
            <span>Xem thêm <strong>Ưu điểm &amp; lưu ý</strong> của sản phẩm</span>
          </div>
          <RightOutlined style={{ fontSize: 12 }} />
        </GalleryHintRow>
      </GalleryContainer>
    </StickyBox>
  );
};

export default ImageGallery;
