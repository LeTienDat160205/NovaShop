import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  addAdminCartItem,
  getAdminCartProducts,
  getCustomerCarts,
  removeAdminCartItem,
  updateAdminCartItem,
} from '../../services/AdminService';

const { Title, Text } = Typography;
const formatPrice = value => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

const AdminCart = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);
  const [addingUser, setAddingUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState();
  const [newQuantity, setNewQuantity] = useState(1);
  const [addLoading, setAddLoading] = useState(false);

  const loadCarts = useCallback(async (keyword = search) => {
    setLoading(true);
    try {
      const result = await getCustomerCarts(keyword);
      setCarts(result.data || []);
    } catch (error) {
      message.error(error.message || 'Không thể tải giỏ hàng.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadCarts(search), 300);
    return () => clearTimeout(timer);
  }, [search, loadCarts]);

  const saveQuantity = async () => {
    if (!editingItem || !quantity) return;
    setSaving(true);
    try {
      await updateAdminCartItem(editingItem.userId, editingItem.productId, quantity);
      message.success('Đã cập nhật số lượng.');
      setEditingItem(null);
      await loadCarts();
    } catch (error) {
      message.error(error.message || 'Không thể cập nhật giỏ hàng.');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (userId, productId) => {
    try {
      await removeAdminCartItem(userId, productId);
      message.success('Đã xóa sản phẩm khỏi giỏ hàng.');
      await loadCarts();
    } catch (error) {
      message.error(error.message || 'Không thể xóa sản phẩm.');
    }
  };

  const openAddModal = async user => {
    setAddingUser(user);
    setSelectedProduct(undefined);
    setNewQuantity(1);
    try {
      const result = await getAdminCartProducts();
      setProducts(result.data || []);
    } catch (error) {
      message.error(error.message || 'Không thể tải danh sách sản phẩm.');
      setAddingUser(null);
    }
  };

  const addItem = async () => {
    if (!addingUser || !selectedProduct) {
      message.warning('Vui lòng chọn sản phẩm.');
      return;
    }
    setAddLoading(true);
    try {
      await addAdminCartItem(addingUser.id, selectedProduct, newQuantity);
      message.success('Đã thêm sản phẩm vào giỏ hàng.');
      setAddingUser(null);
      await loadCarts();
    } catch (error) {
      message.error(error.message || 'Không thể thêm sản phẩm.');
    } finally {
      setAddLoading(false);
    }
  };

  const itemColumns = userId => [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      render: (name, item) => (
        <Space>
          {item.image && <Image src={item.image} alt={name} width={44} height={44} style={{ objectFit: 'contain' }} />}
          <span>{name}</span>
        </Space>
      ),
    },
    { title: 'Đơn giá', dataIndex: 'price', render: formatPrice },
    { title: 'Số lượng', dataIndex: 'quantity', width: 100 },
    { title: 'Thành tiền', dataIndex: 'totalPrice', render: formatPrice },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 170,
      render: (_, item) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditingItem({ userId, productId: item.productId, name: item.name });
              setQuantity(item.quantity);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm khỏi giỏ hàng?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteItem(userId, item.productId)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns = [
    { title: 'Khách hàng', dataIndex: ['user', 'name'], key: 'name' },
    { title: 'Email', dataIndex: ['user', 'email'], key: 'email' },
    { title: 'Số điện thoại', dataIndex: ['user', 'phone'], key: 'phone', render: phone => phone || '—' },
    { title: 'Số sản phẩm', key: 'count', render: (_, row) => row.items.length },
    { title: 'Tổng giỏ hàng', dataIndex: 'total', key: 'total', render: formatPrice },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, row) => (
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={event => {
          event.stopPropagation();
          openAddModal(row.user);
        }}>
          Thêm sản phẩm
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Giỏ hàng khách hàng</Title>
      <Text type="secondary">Chọn một tài khoản để xem và quản lý các sản phẩm trong giỏ hàng.</Text>
      <div style={{ margin: '18px 0' }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm tài khoản theo tên, email hoặc số điện thoại"
          value={search}
          onChange={event => setSearch(event.target.value)}
          style={{ maxWidth: 460 }}
        />
      </div>
      <Table
        rowKey={row => row.user.id}
        columns={columns}
        dataSource={carts}
        loading={loading}
        expandable={{
          expandedRowKeys,
          expandRowByClick: true,
          onExpandedRowsChange: keys => setExpandedRowKeys(keys),
          expandedRowRender: row => (
            <div style={{ background: '#fff1f0', borderLeft: '3px solid #ff4d4f', padding: 16 }}>
              <Text strong>Giỏ hàng của {row.user.name}</Text>
              <Table
                style={{ marginTop: 10 }}
                rowKey="productId"
                columns={itemColumns(row.user.id)}
                dataSource={row.items}
                pagination={false}
                size="small"
                locale={{ emptyText: 'Tài khoản chưa có sản phẩm trong giỏ hàng.' }}
              />
            </div>
          ),
        }}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 800 }}
        locale={{ emptyText: 'Không tìm thấy tài khoản khách hàng.' }}
      />

      <Modal
        title={`Thêm sản phẩm vào giỏ hàng${addingUser ? ` — ${addingUser.name}` : ''}`}
        open={!!addingUser}
        onCancel={() => setAddingUser(null)}
        onOk={addItem}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={addLoading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Chọn sản phẩm"
            value={selectedProduct}
            onChange={setSelectedProduct}
            options={products.map(product => ({
              value: product._id,
              label: `${product.name} — ${formatPrice(product.price)}`,
            }))}
            style={{ width: '100%' }}
          />
          <InputNumber min={1} max={99} value={newQuantity} onChange={value => setNewQuantity(value || 1)} />
        </Space>
      </Modal>

      <Modal
        title={`Sửa số lượng: ${editingItem?.name || ''}`}
        open={!!editingItem}
        onCancel={() => setEditingItem(null)}
        onOk={saveQuantity}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
      >
        <InputNumber min={1} max={99} value={quantity} onChange={value => setQuantity(value || 1)} />
      </Modal>
    </div>
  );
};

export default AdminCart;
