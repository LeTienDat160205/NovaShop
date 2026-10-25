import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { addFavorite, checkFavorite, removeFavorite } from '../../services/FavoriteService';
import { getAuthSession } from '../../utils/authSession';

const FavoriteButton = ({ productId }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const session = getAuthSession();
    if (!session.token || session.role !== 'Customer' || !productId) {
      return undefined;
    }
    checkFavorite(productId)
      .then(result => {
        if (active) setIsFavorite(Boolean(result.isFavorite));
      })
      .catch(error => {
        if (active && error.status !== 401) {
          message.error(error.message || 'Không thể tải trạng thái yêu thích.');
        }
      });
    return () => { active = false; };
  }, [productId]);

  const toggleFavorite = async () => {
    const session = getAuthSession();
    if (!session.token || session.role !== 'Customer') {
      message.warning('Đăng nhập bằng tài khoản khách hàng để lưu sản phẩm yêu thích.');
      navigate('/sign-in', { state: { from: window.location.pathname } });
      return;
    }

    setLoading(true);
    try {
      const result = isFavorite
        ? await removeFavorite(productId)
        : await addFavorite(productId);
      setIsFavorite(!isFavorite);
      message.success(result.message);
    } catch (error) {
      message.error(error.message || 'Không thể cập nhật danh sách yêu thích.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      icon={isFavorite ? <HeartFilled style={{ color: '#ff424e' }} /> : <HeartOutlined />}
      loading={loading}
      onClick={toggleFavorite}
      aria-pressed={isFavorite}
    >
      {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
    </Button>
  );
};

export default FavoriteButton;
