import { useCallback, useEffect, useState } from 'react';
import { Button, Popconfirm, Rate, Space, Table, Typography, message } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { deleteAdminReview, getAdminReviews } from '../../services/AdminService';

const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminReviews();
      setReviews(response.data || []);
    } catch (error) {
      message.error(error.message || 'Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminReviews()
      .then(response => {
        if (active) setReviews(response.data || []);
      })
      .catch(error => {
        if (active) message.error(error.message || 'Không thể tải danh sách đánh giá.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const removeReview = async id => {
    try {
      await deleteAdminReview(id);
      message.success('Đã xóa đánh giá.');
      await loadReviews();
    } catch (error) {
      message.error(error.message || 'Không thể xóa đánh giá.');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, review) => (
        <div>
          <div>{review.userName}</div>
          {review.userEmail && <Typography.Text type="secondary">{review.userEmail}</Typography.Text>}
        </div>
      ),
    },
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: rating => <Rate disabled value={rating} />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      render: comment => <div style={{ whiteSpace: 'pre-wrap', minWidth: 180 }}>{comment}</div>,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => date ? new Date(date).toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, review) => (
        <Popconfirm
          title="Xóa đánh giá này?"
          description="Thao tác này không thể hoàn tác."
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => removeReview(review._id)}
        >
          <Button danger icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 10 }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Quản lý đánh giá</Typography.Title>
        <Button icon={<ReloadOutlined />} onClick={loadReviews} loading={loading}>Làm mới</Button>
      </Space>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={reviews}
        loading={loading}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        locale={{ emptyText: 'Chưa có đánh giá.' }}
      />
    </div>
  );
};

export default AdminReview;
