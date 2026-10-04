import styled from 'styled-components';
import { token } from './tokens';

// ─── Layout wrappers ─────────────────────────────────────────────────────────

export const PageWrapper = styled.div`
  background: ${token.colorBg};
  min-height: 100vh;
  padding: ${token.spacing.md} ${token.spacing.xl} 48px;
  overflow-x: hidden; /* Ngăn chặn hoàn toàn tràn ngang */
  box-sizing: border-box;

  @media (max-width: ${token.breakpoint.tablet}) {
    /* 90px padding-bottom để thanh mua hàng cố định (height ~60px) KHÔNG che bất kỳ nội dung nào */
    padding: 8px 8px 90px;
  }
`;

export const ContentWrapper = styled.div`
  max-width: ${token.maxWidth};
  margin: 0 auto;
  box-sizing: border-box;
`;

// Grid 3 cột:
// Desktop (>=1200px): 320px 1fr 300px
// Tablet (768px - 1199px): 300px 1fr (Khung mua hàng span 2 cột bên dưới)
// Mobile (<768px): 1 cột
export const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr 300px;
  gap: ${token.spacing.lg};
  align-items: start;

  @media (max-width: ${token.breakpoint.desktop}) and (min-width: ${token.breakpoint.tablet}) {
    grid-template-columns: 300px 1fr;
    gap: 16px;
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

// Wrapper cho PurchaseBox: ở tablet (768-1199px) span full 2 cột
export const PurchaseBoxGridItem = styled.div`
  @media (max-width: ${token.breakpoint.desktop}) and (min-width: ${token.breakpoint.tablet}) {
    grid-column: 1 / -1;
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    display: none; /* Trên mobile ẩn PurchaseBox desktop, chuyển sang MobileBuyBar */
  }
`;

export const StickyBox = styled.div`
  position: sticky;
  top: ${token.stickyTop};

  @media (max-width: ${token.breakpoint.desktop}) {
    position: static; /* Trên tablet và mobile không cần sticky để tránh lỗi vị trí */
  }
`;

// ─── Card trắng — block cơ bản ───────────────────────────────────────────────

export const SectionCard = styled.div`
  background: ${token.colorCard};
  border-radius: ${token.borderRadius};
  box-shadow: ${token.boxShadow};
  padding: ${token.spacing.lg};
  margin-bottom: ${token.spacing.md};
  box-sizing: border-box;

  @media (max-width: ${token.breakpoint.tablet}) {
    padding: 12px;
    margin-bottom: 10px;
  }
`;

export const CardTitle = styled.h3`
  font-size: ${token.fontSize.lg};
  font-weight: 600;
  color: ${token.colorTextPrimary};
  margin: 0 0 ${token.spacing.md} 0;

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 15px;
    margin-bottom: 10px;
  }
`;

// ─── Giá cả ──────────────────────────────────────────────────────────────────

export const PriceBlock = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;

  @media (max-width: ${token.breakpoint.tablet}) {
    margin: 8px 0;
  }
`;

export const PriceText = styled.span`
  font-size: 26px;
  font-weight: 600;
  color: ${token.colorTextPrimary};
  line-height: 1.2;

  .currency {
    font-size: 16px;
    font-weight: 500;
    vertical-align: top;
    margin-left: 2px;
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 22px;
  }
`;

export const ListPriceText = styled.span`
  font-size: 14px;
  color: ${token.colorTextSecondary};
  text-decoration: line-through;
  margin-left: 4px;

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 13px;
  }
`;

export const DiscountBadge = styled.span`
  display: inline-block;
  background: #FFF0F1;
  color: ${token.colorDanger};
  border: 1px solid ${token.colorDanger};
  font-size: 11px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: ${token.borderRadiusSm};
  margin-left: 4px;
`;

// ─── Badge ────────────────────────────────────────────────────────────────────

export const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;

  .brand-text {
    font-size: 13px;
    color: ${token.colorTextSecondary};
    white-space: nowrap; /* Không ngắt đôi chữ Thương hiệu: */
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    gap: 4px;
    .brand-text {
      font-size: 12px;
    }
  }
`;

export const BadgeChip = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.2px;
  white-space: nowrap;

  &.top-deal {
    color: #FF424E;
    background: #FFF0F1;
    border: 1px solid #FFCCD0;
  }
  &.exchange {
    color: #0B74E5;
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
  }
  &.authentic {
    color: #00AB56;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 10px;
    padding: 1px 5px;
  }
`;

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

export const BreadcrumbWrapper = styled.nav`
  font-size: 13px;
  color: ${token.colorTextSecondary};
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  line-height: 1.4;

  a {
    color: ${token.colorTextSecondary};
    text-decoration: none;
    transition: color 0.2s;
    &:hover {
      color: ${token.colorPrimary};
    }
  }

  .separator {
    color: ${token.colorTextMuted};
    font-size: 11px;
    user-select: none;
  }

  .current {
    color: ${token.colorTextPrimary};
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 450px;
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 12px;
    margin-bottom: 8px;
    .current {
      max-width: 200px;
    }
  }
`;

// ─── Image Gallery ────────────────────────────────────────────────────────────

export const GalleryContainer = styled.div`
  background: ${token.colorCard};
  border-radius: ${token.borderRadius};
  box-shadow: ${token.boxShadow};
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: ${token.breakpoint.tablet}) {
    padding: 10px;
  }
`;

export const GalleryMainImage = styled.div`
  border: 1px solid ${token.colorBorder};
  border-radius: ${token.borderRadius};
  overflow: hidden;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.25s ease;
  }

  &:hover img {
    transform: scale(1.02);
  }
`;

export const ThumbnailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
`;

export const ThumbnailList = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none; /* Ẩn scrollbar xấu xí */
  &::-webkit-scrollbar {
    display: none;
  }
  flex: 1;
`;

export const ThumbnailItem = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: ${token.borderRadiusSm};
  border: 2px solid ${({ $active }) => ($active ? token.colorBorderActive : token.colorBorder)};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: ${token.colorBorderActive};
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    width: 44px;
    height: 44px;
  }
`;

export const ArrowBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid ${token.colorBorder};
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  color: ${token.colorTextSecondary};
  font-size: 11px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    color: ${token.colorPrimary};
    border-color: ${token.colorPrimary};
  }

  &:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
`;

export const GalleryHintRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${token.colorBorder};
  font-size: 13px;
  color: ${token.colorPrimary};
  cursor: pointer;

  .hint-left {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${token.colorTextPrimary};
    font-size: 13px;
  }

  &:hover .hint-left {
    color: ${token.colorPrimary};
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 12px;
    .hint-left {
      font-size: 12px;
    }
  }
`;

// ─── Product Info ─────────────────────────────────────────────────────────────

export const ProductName = styled.h1`
  font-size: 20px;
  font-weight: 500;
  color: ${token.colorTextPrimary};
  line-height: 28px;
  margin: 6px 0;
  word-break: break-word;

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 17px;
    line-height: 24px;
  }
`;

export const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${token.colorTextSecondary};
  flex-wrap: wrap;

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 12px;
  }
`;

export const RatingNumber = styled.span`
  font-size: 14px;
  color: ${token.colorTextPrimary};
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
`;

export const OriginText = styled.div`
  font-size: 13px;
  color: ${token.colorTextSecondary};
  margin-top: 4px;
`;

// ─── Thông số kỹ thuật ────────────────────────────────────────────────────────

export const SpecTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  tr {
    border-bottom: 1px solid #F2F2F2;
  }

  tr:nth-child(odd) {
    background: #FFFFFF;
  }

  tr:nth-child(even) {
    background: ${token.colorRowStripe};
  }

  td {
    padding: 10px 14px;
    vertical-align: top;
    line-height: 1.5;
    word-break: break-word;
  }

  td:first-child {
    color: ${token.colorTextSecondary};
    width: 42%;
    font-weight: 400;
  }

  td:last-child {
    color: ${token.colorTextPrimary};
    font-weight: 400;
  }

  tr:last-child {
    border-bottom: none;
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 13px;
    td {
      padding: 8px 10px;
    }
  }
`;

// ─── Mô tả sản phẩm ──────────────────────────────────────────────────────────

export const DescriptionContent = styled.div`
  font-size: 14px;
  line-height: 1.7;
  color: ${token.colorTextPrimary};
  position: relative;
  overflow: hidden;
  max-height: ${({ $expanded }) => ($expanded ? 'none' : '220px')};
  white-space: pre-wrap;
  word-break: break-word;

  &::after {
    content: '';
    display: ${({ $expanded }) => ($expanded ? 'none' : 'block')};
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 13px;
  }
`;

export const ExpandButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
`;

export const ExpandButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #0B74E5;
  color: #0B74E5;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 20px;
  border-radius: 100px;
  transition: all 0.2s;

  &:hover {
    background: #EFF6FF;
  }
`;

// ─── Purchase Box ─────────────────────────────────────────────────────────────

export const SellerBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${token.colorBorder};
  margin-bottom: 12px;
`;

export const OfficialBadge = styled.span`
  background: #0B74E5;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 2px;
  letter-spacing: 0.5px;
`;

export const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${token.colorBorder};
  border-radius: ${token.borderRadiusSm};
  overflow: hidden;
  width: fit-content;
`;

export const QtyBtn = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  color: ${token.colorTextPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:hover { background: #F5F5FA; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

export const QtyInput = styled.input`
  width: 44px;
  height: 32px;
  border: none;
  border-left: 1px solid ${token.colorBorder};
  border-right: 1px solid ${token.colorBorder};
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${token.colorTextPrimary};
  outline: none;
  background: #fff;
`;

export const TotalPrice = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${token.colorTextPrimary};
  margin: 6px 0 12px;

  .currency {
    font-size: 16px;
    vertical-align: top;
    font-weight: 500;
    margin-left: 2px;
  }
`;

// ─── Mobile Buy Bar (Thanh cố định đáy trên Mobile) ──────────────────────────

export const MobileBuyBar = styled.div`
  display: none;

  @media (max-width: ${token.breakpoint.tablet}) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: #fff;
    padding: 10px 16px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.12);
    gap: 10px;
    align-items: center;
    box-sizing: border-box;
  }
`;

export const MobilePriceText = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${token.colorDanger};
  flex: 1;
  white-space: nowrap;
`;

// ─── Review Section (Responsive trên Mobile) ─────────────────────────────────

export const ReviewOverviewWrapper = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: ${token.breakpoint.tablet}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
`;

export const ReviewScoreBlock = styled.div`
  text-align: center;
  min-width: 110px;

  @media (max-width: ${token.breakpoint.tablet}) {
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

export const BigScore = styled.div`
  font-size: 44px;
  font-weight: 700;
  color: ${token.colorTextPrimary};
  line-height: 1;

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 36px;
  }
`;

export const RatingBarContainer = styled.div`
  flex: 1;
  min-width: 0; /* Cho phép flex item co lại, không gây tràn ngang */
  width: 100%;
  max-width: 360px;
`;

export const RatingBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-bottom: 4px;
  width: 100%;
`;

export const RatingBar = styled.div`
  flex: 1;
  height: 6px;
  background: #ECECF0;
  border-radius: 3px;
  overflow: hidden;

  div {
    height: 100%;
    background: #0B74E5;
    border-radius: 3px;
    width: ${({ $pct }) => $pct}%;
  }
`;

export const ReviewImageThumb = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #E5E5E5;

  @media (max-width: ${token.breakpoint.tablet}) {
    width: 42px;
    height: 42px;
  }
`;

export const ReviewImageMore = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: #27272A;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  @media (max-width: ${token.breakpoint.tablet}) {
    width: 42px;
    height: 42px;
  }
`;

export const FilterChip = styled.button`
  border: 1px solid ${({ $active }) => ($active ? '#0B74E5' : '#EBEBF0')};
  background: ${({ $active }) => ($active ? '#EFF6FF' : '#fff')};
  color: ${({ $active }) => ($active ? '#0B74E5' : '#27272A')};
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  white-space: nowrap;

  &:hover {
    border-color: #0B74E5;
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    font-size: 12px;
    padding: 4px 10px;
  }
`;

export const ReviewCard = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #F2F2F2;

  &:last-child { border-bottom: none; }
`;

export const ReviewAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #E5E7EB;
  color: #4B5563;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

// ─── Placeholder ──────────────────────────────────────────────────────────────

export const PlaceholderBox = styled.div`
  height: ${({ $height }) => $height || '120px'};
  background: #F8F8FA;
  border-radius: ${token.borderRadiusSm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${token.colorTextMuted};
  font-size: 13px;
  border: 1px dashed ${token.colorBorder};
`;

// ─── Recently Viewed / Explore More ──────────────────────────────────────────

export const HorizontalScrollRow = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;

  @media (max-width: ${token.breakpoint.desktop}) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
`;

export const ExploreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;

  @media (max-width: ${token.breakpoint.desktop}) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: ${token.breakpoint.tablet}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
`;

export const TabRow = styled.div`
  display: flex;
  gap: 12px;
  border-bottom: 2px solid ${token.colorBorder};
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none;
`;

export const TabItem = styled.button`
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $active }) => ($active ? token.colorPrimary : 'transparent')};
  margin-bottom: -2px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${({ $active }) => ($active ? token.colorPrimary : token.colorTextSecondary)};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
`;

export const Divider = styled.div`
  height: 1px;
  background: ${token.colorBorder};
  margin: 12px 0;
`;

export const LinkText = styled.a`
  color: ${token.colorPrimary};
  font-size: 14px;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

export const NotFoundWrapper = styled.div`
  text-align: center;
  padding: 60px 16px;
  background: ${token.colorCard};
  border-radius: ${token.borderRadius};
  box-shadow: ${token.boxShadow};

  h2 { color: ${token.colorTextPrimary}; margin-bottom: 12px; }
  p  { color: ${token.colorTextSecondary}; }
`;