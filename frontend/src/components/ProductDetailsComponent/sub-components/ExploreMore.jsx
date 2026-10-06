import React, { useEffect, useState } from 'react';
import {
  SectionCard,
  CardTitle,
  ExploreGrid,
  TabRow,
  TabItem,
} from '../style';
import CardComponent from '../../CardComponent/CardComponent';
import * as ProductService from '../../../services/ProductService';

const TABS = ['Dành cho bạn', 'Mới nhất'];
const PRODUCT_LIMIT = 12;

const ExploreMore = ({ currentProductId }) => {
  const [activeTab, setActiveTab] = useState('Dành cho bạn');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);

        // Dùng ProductService có sẵn của project
        const response = await ProductService.getAllProduct();

        if (response?.status !== 'OK') {
          setProducts([]);
          return;
        }

        const allProducts = response.data || [];

        // Không hiển thị sản phẩm hiện tại
        const filteredProducts = allProducts.filter(
          (product) => product._id !== currentProductId
        );

        let resultProducts = [];

        if (activeTab === 'Dành cho bạn') {
          // Tạm thời: ưu tiên sản phẩm có rating cao
          resultProducts = [...filteredProducts]
            .sort(
              (a, b) =>
                (Number(b.rating) || 0) -
                (Number(a.rating) || 0)
            )
            .slice(0, PRODUCT_LIMIT);
        } else {
          // Sản phẩm mới nhất
          resultProducts = [...filteredProducts]
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            )
            .slice(0, PRODUCT_LIMIT);
        }

        setProducts(resultProducts);
      } catch (error) {
        console.error(
          'Lỗi tải sản phẩm khám phá:',
          error
        );
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [activeTab, currentProductId]);

  return (
    <SectionCard>
      <CardTitle
        style={{
          borderBottom: 'none',
          paddingBottom: 0,
          marginBottom: 0,
        }}
      >
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

      {isLoading ? (
        <div style={{ padding: '20px 0' }}>
          Đang tải sản phẩm...
        </div>
      ) : (
        <ExploreGrid>
          {products.map((product) => (
            <CardComponent
              key={product._id}
              product={product}
            />
          ))}
        </ExploreGrid>
      )}
    </SectionCard>
  );
};

export default ExploreMore;