import React, { useState } from 'react';
import { SectionCard, CardTitle, ExploreGrid, TabRow, TabItem } from '../style';
import CardComponent from '../../CardComponent/CardComponent';
import { mockExploreMore } from '../../../data/mockProductDetail';

const TABS = ['Dành cho bạn', 'Mới nhất'];

const ExploreMore = () => {
  const [activeTab, setActiveTab] = useState('Dành cho bạn');

  return (
    <SectionCard>
      <CardTitle style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
        Khám phá thêm
      </CardTitle>

      <TabRow>
        {TABS.map((tab) => (
          <TabItem
            key={tab}
            $active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </TabItem>
        ))}
      </TabRow>

      <ExploreGrid>
        {mockExploreMore.map((product) => (
          <CardComponent key={product._id} product={product} />
        ))}
      </ExploreGrid>
    </SectionCard>
  );
};

export default ExploreMore;
