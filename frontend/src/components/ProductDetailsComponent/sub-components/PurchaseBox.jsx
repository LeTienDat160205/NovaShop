import React, { useState } from 'react';
import { MinusOutlined, PlusOutlined, StarFilled } from '@ant-design/icons';
import {
  StickyBox,
  SectionCard,
  SellerBlock,
  OfficialBadge,
  QuantityControl,
  QtyBtn,
  QtyInput,
  TotalPrice,
  Divider,
} from '../style';
import { token } from '../tokens';
import ButtonComponent from '../../ButtonComponent/ButtonComponent';
import logo from '../../../assets/images/logo.png';

const formatNumber = (amount) =>
  amount ? Number(amount).toLocaleString('vi-VN') : '0';

const PurchaseBox = ({
  productId = '',
  price = 0,
  onAddToCart = () => {},
  onBuyNow = () => {},
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) setQuantity(val);
  };

  const total = price * quantity;

  return (
    <StickyBox>
      <SectionCard>
        {/* Khối người bán */}
        <SellerBlock>
          <img
            src={logo}
            alt="NovaShop"
            style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 4 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: token.colorTextPrimary }}>
                NovaShop
              </span>
              <OfficialBadge>OFFICIAL</OfficialBadge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: token.colorTextPrimary }}>4.7</span>
              <StarFilled style={{ color: token.colorStar, fontSize: 12 }} />
              <span style={{ color: token.colorTextSecondary }}>(5.6k+ đánh giá)</span>
            </div>
          </div>
        </SellerBlock>

        {/* Số lượng */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: token.colorTextPrimary, marginBottom: 8 }}>
            Số Lượng
          </div>
          <QuantityControl>
            <QtyBtn onClick={handleDecrement} disabled={quantity <= 1} aria-label="Giảm">
              <MinusOutlined style={{ fontSize: 11, color: '#555' }} />
            </QtyBtn>
            <QtyInput
              type="number"
              value={quantity}
              onChange={handleInputChange}
              min={1}
              aria-label="Số lượng"
            />
            <QtyBtn onClick={handleIncrement} aria-label="Tăng">
              <PlusOutlined style={{ fontSize: 11, color: '#555' }} />
            </QtyBtn>
          </QuantityControl>
        </div>

        {/* Tạm tính */}
        <div>
          <div style={{ fontSize: 13, color: token.colorTextSecondary }}>Tạm tính</div>
          <TotalPrice>
            {formatNumber(total)}
            <span className="currency">₫</span>
          </TotalPrice>
        </div>

        <Divider style={{ margin: '14px 0 16px' }} />

        {/* Nút mua ngay — Payload: { productId, quantity, price } */}
        <ButtonComponent
          onClick={() => onBuyNow({ productId, quantity, price })}
          textButton="Mua ngay"
          styleButton={{
            backgroundColor: token.colorDanger,
            border: 'none',
            borderRadius: token.borderRadiusSm,
            width: '100%',
            height: 44,
            marginBottom: 10,
            cursor: 'pointer',
          }}
          styleTextButton={{ color: '#fff', fontSize: 15, fontWeight: 600 }}
        />

        {/* Nút thêm vào giỏ — Payload: { productId, quantity, price } */}
        <ButtonComponent
          onClick={() => onAddToCart({ productId, quantity, price })}
          textButton="Thêm vào giỏ"
          styleButton={{
            backgroundColor: '#fff',
            border: `1px solid ${token.colorPrimary}`,
            borderRadius: token.borderRadiusSm,
            width: '100%',
            height: 44,
            cursor: 'pointer',
          }}
          styleTextButton={{ color: token.colorPrimary, fontSize: 15, fontWeight: 500 }}
        />
      </SectionCard>
    </StickyBox>
  );
};

export default PurchaseBox;
