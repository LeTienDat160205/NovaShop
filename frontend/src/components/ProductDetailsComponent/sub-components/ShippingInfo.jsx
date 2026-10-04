import React from 'react';
import { EnvironmentOutlined } from '@ant-design/icons';
import { SectionCard, CardTitle, LinkText, Divider } from '../style';
import { token } from '../tokens';
import { mockShipping } from '../../../data/mockProductDetail';

const ShippingInfo = () => {
  const { address, expressDelivery, standardDelivery } = mockShipping;

  return (
    <SectionCard>
      <CardTitle style={{ fontSize: 16 }}>Thông tin vận chuyển</CardTitle>

      {/* Địa chỉ giao hàng */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined style={{ color: token.colorTextSecondary, fontSize: 16 }} />
          <span style={{ fontSize: 14, color: token.colorTextSecondary }}>
            Giao đến <strong style={{ color: token.colorTextPrimary, textDecoration: 'underline' }}>{address}</strong>
          </span>
        </div>
        <LinkText href="#" style={{ fontSize: 14, fontWeight: 500 }}>
          Đổi
        </LinkText>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* Giao siêu tốc 2h có badge NOW đỏ nghiêng */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{
            color: '#FF424E',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 12,
            letterSpacing: '0.5px',
          }}>
            NOW
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: token.colorTextPrimary }}>
            {expressDelivery.label}
          </span>
        </div>
        <div style={{ fontSize: 13, color: token.colorTextSecondary, paddingLeft: 38 }}>
          {expressDelivery.note}:{' '}
          <span style={{ color: '#00AB56', fontWeight: 600 }}>
            {expressDelivery.price}
          </span>{' '}
          <span style={{ textDecoration: 'line-through', color: token.colorTextSecondary, marginLeft: 4 }}>
            {expressDelivery.originalPrice}
          </span>
        </div>
      </div>

      {/* Giao tiêu chuẩn */}
      <div style={{ paddingLeft: 38 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: token.colorTextPrimary, marginBottom: 2 }}>
          {standardDelivery.label}
        </div>
        <div style={{ fontSize: 13, color: token.colorTextSecondary }}>
          {standardDelivery.price}
        </div>
      </div>
    </SectionCard>
  );
};

export default ShippingInfo;
