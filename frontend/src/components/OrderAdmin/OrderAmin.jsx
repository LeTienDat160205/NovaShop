import { useCallback, useEffect, useState } from 'react';
import { message, Select, Space, Table, Tag, Typography } from 'antd';
import { getAdminOrders, updateAdminOrderStatus } from '../../services/AdminService';

const { Title } = Typography;
const statusLabels = {
  Pending: 'Chờ xác nhận',
  Processing: 'Đang xử lý',
  Delivered: 'Hoàn tất',
  Cancelled: 'Đã hủy',
};
const statusColors = {
  Pending: 'orange',
  Processing: 'blue',
  Delivered: 'green',
  Cancelled: 'red',
};
const formatPrice = value => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

const OrderAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      const result = await getAdminOrders();
      setOrders(result.data || []);
    } catch (error) {
      message.error(error.message || 'Không thể tải đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshOrders = () => {
      getAdminOrders()
        .then(result => setOrders(result.data || []))
        .catch(error => message.error(error.message || 'Không thể tải đơn hàng.'))
        .finally(() => setLoading(false));
    };
    refreshOrders();
    const timer = window.setInterval(refreshOrders, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const updateStatus = async (order, status) => {
    setUpdatingId(order._id);
    setLoading(true);
    try {
      await updateAdminOrderStatus(order._id, status);
      message.success('Đã cập nhật trạng thái đơn hàng.');
      await loadOrders();
    } catch (error) {
      message.error(error.message || 'Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      render: id => `#${String(id).slice(-8).toUpperCase()}`,
    },
    { title: 'Khách hàng', render: (_, order) => order.userId?.name || 'Tài khoản đã xóa' },
    {
      title: 'Điện thoại',
      dataIndex: 'shippingPhone',
      render: (phone, order) => phone || order.userId?.phone || '—',
    },
    { title: 'Địa chỉ', dataIndex: 'shippingAddress', ellipsis: true },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      render: items => (items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      render: (value, order) => (
        <Space direction="vertical" size={2}>
          <span>{value === 'COD' ? 'Thanh toán khi nhận hàng' : value === 'MOMO' ? 'Ví MoMo' : value || '—'}</span>
          {value === 'MOMO' && (
            <Tag color={order.paymentStatus === 'Paid' ? 'green' : order.paymentStatus === 'Failed' ? 'red' : 'orange'}>
              {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : order.paymentStatus === 'Failed' ? 'Thất bại' : 'Đang chờ'}
            </Tag>
          )}
        </Space>
      ),
    },
    { title: 'Tổng tiền', dataIndex: 'totalPrice', render: formatPrice },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status, order) => (
        <Select
          value={status}
          loading={updatingId === order._id}
          disabled={updatingId === order._id}
          onChange={value => updateStatus(order, value)}
          style={{ minWidth: 150 }}
          options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
          optionRender={option => <Tag color={statusColors[option.value]}>{option.label}</Tag>}
        />
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      render: value => value ? new Date(value).toLocaleString('vi-VN') : '—',
    },
  ];

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 18 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý đơn hàng</Title>
        <a onClick={() => { setLoading(true); loadOrders(); }}>Làm mới</a>
      </Space>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
        locale={{ emptyText: 'Chưa có đơn hàng.' }}
      />
    </div>
  );
};

export default OrderAdmin;
