import React from 'react';
import { SectionCard, CardTitle, HorizontalScrollRow } from '../style';
import CardComponent from '../../CardComponent/CardComponent';
import { mockRecentlyViewed } from '../../../data/mockProductDetail';

const RecentlyViewed = () => (
  <SectionCard>
    <CardTitle>Sản phẩm bạn đã xem</CardTitle>
    <HorizontalScrollRow>
      {mockRecentlyViewed.map((product) => (
        <CardComponent key={product._id} product={product} />
      ))}
    </HorizontalScrollRow>
  </SectionCard>
);

export default RecentlyViewed;
