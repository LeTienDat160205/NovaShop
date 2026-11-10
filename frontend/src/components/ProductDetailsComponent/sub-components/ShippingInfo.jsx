import React, { useEffect, useState } from 'react';
import { EnvironmentOutlined } from '@ant-design/icons';
import { SectionCard, CardTitle, Divider } from '../style';
import { token } from '../tokens';
import { getCurrentUser } from '../../../services/AuthService';
import { getAuthSession } from '../../../utils/authSession';

const ShippingInfo = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const tokenValue = getAuthSession().token;
    if (!tokenValue) { setLoading(false); return; }
    getCurrentUser(tokenValue).then(result => setAddress(result.user?.address || '')).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const label = loading ? 'Đang tải địa chỉ...' : address || 'Bạn chưa cập nhật địa chỉ giao hàng';
  return <SectionCard><CardTitle style={{ fontSize: 16 }}>Thông tin vận chuyển</CardTitle><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><EnvironmentOutlined style={{ color: token.colorTextSecondary, fontSize: 16 }} /><span style={{ fontSize: 14, color: token.colorTextSecondary }}>Giao đến <strong style={{ color: token.colorTextPrimary }}>{label}</strong></span></div><Divider style={{ margin: '12px 0' }} /><div style={{ color: token.colorTextSecondary, fontSize: 13 }}>Giao hàng tiêu chuẩn · Miễn phí vận chuyển</div></SectionCard>;
};
export default ShippingInfo;
