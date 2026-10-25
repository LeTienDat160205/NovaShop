import { useEffect, useState } from 'react';
import { Button, Empty, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import CardComponent from '../../components/CardComponent/CardComponent';
import { getFavorites, removeFavorite } from '../../services/FavoriteService';
import { getAuthSession } from '../../utils/authSession';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const session = getAuthSession();
    if (!session.token || session.role !== 'Customer') {
      navigate(!session.token ? '/sign-in' : '/', { replace: true });
      return undefined;
    }

    getFavorites()
      .then(result => {
        if (active) setProducts(result.data || []);
      })
      .catch(error => {
        if (active) message.error(error.message || 'Không thể tải danh sách yêu thích.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [navigate]);

  const handleRemove = async (productId) => {
    try {
      const result = await removeFavorite(productId);
      setProducts(current => current.filter(product => product._id !== productId));
      message.success(result.message);
    } catch (error) {
      message.error(error.message || 'Không thể xóa sản phẩm yêu thích.');
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 72px)', background: '#f5f5fa', padding: '24px clamp(16px, 5vw, 80px)' }}>
      <h2>Sản phẩm yêu thích</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin size="large" /></div>
      ) : products.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 8, padding: 40, textAlign: 'center' }}>
          <Empty description="Bạn chưa lưu sản phẩm yêu thích nào." />
          <Button type="primary" onClick={() => navigate('/products')} style={{ marginTop: 16 }}>Khám phá sản phẩm</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
          {products.map(product => (
            <div key={product._id}>
              <CardComponent product={product} />
              <Button danger block onClick={() => handleRemove(product._id)} style={{ marginTop: 8 }}>
                Xóa khỏi yêu thích
              </Button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default FavoritesPage;
