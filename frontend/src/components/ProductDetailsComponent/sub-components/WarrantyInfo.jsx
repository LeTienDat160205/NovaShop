import React from 'react';
import { SectionCard, CardTitle, LinkText } from '../style';

const WarrantyInfo = () => (
  <SectionCard>
    <CardTitle>Thông tin bảo hành</CardTitle>
    <div style={{ fontSize: 14 }}>
      Hướng dẫn bảo hành:{' '}
      <LinkText href="#" target="_blank" rel="noopener noreferrer">
        Xem chi tiết
      </LinkText>
    </div>
  </SectionCard>
);

export default WarrantyInfo;
