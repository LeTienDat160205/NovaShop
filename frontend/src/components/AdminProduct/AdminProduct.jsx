import {
  Button,
  Cascader,
  Col,
  Form,
  Input,
  InputNumber,
  message as antMessage,
  Modal,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  getAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from '../../services/AdminProductService';

const { Text } = Typography;
const { TextArea } = Input;

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Định dạng giá tiền VND */
function formatVND(value) {
  if (value == null || value === '') return '—';
  return Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

/**
 * Xây dựng cây Cascader từ mảng chuỗi group ("A/B/C").
 * Trả về [{ value, label, children? }]
 */
function buildCascaderOptions(groups) {
  const root = [];
  for (const g of groups) {
    if (!g) continue;
    const parts = g.split('/').map((p) => p.trim()).filter(Boolean);
    let nodes = root;
    for (const part of parts) {
      let node = nodes.find((n) => n.value === part);
      if (!node) {
        node = { value: part, label: part };
        nodes.push(node);
      }
      if (!node.children) node.children = [];
      nodes = node.children;
    }
  }
  // Dọn children rỗng
  function clean(arr) {
    for (const n of arr) {
      if (n.children && n.children.length === 0) delete n.children;
      else if (n.children) clean(n.children);
    }
  }
  clean(root);
  return root;
}

/** Chuyển chuỗi group → mảng path cho Cascader value */
function groupToPath(group) {
  if (!group) return [];
  return group.split('/').map((p) => p.trim()).filter(Boolean);
}

// ─── Component chính ────────────────────────────────────────────────────────

const AdminProduct = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Bảng
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [tableLoading, setTableLoading] = useState(false);

  // Danh mục Cascader
  const [cascaderOptions, setCascaderOptions] = useState([]);

  // Modal thêm/sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = thêm mới
  const [savingLoading, setSavingLoading] = useState(false);

  // Modal xóa
  const [deleteTarget, setDeleteTarget] = useState(null); // { _id, name }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search
  const searchTimer = useRef(null);

  // ── Auth error handler ────────────────────────────────────────────────────
  const handleAuthError = useCallback(
    (err) => {
      if (err.status === 401 || err.status === 403) {
        antMessage.error('Phiên đăng nhập hết hạn hoặc không có quyền truy cập');
        navigate('/sign-in');
        return true;
      }
      return false;
    },
    [navigate],
  );

  // ── Tải danh mục ──────────────────────────────────────────────────────────
  useEffect(() => {
    getAdminCategories()
      .then((res) => {
        const groups = Array.isArray(res) ? res : res.data ?? [];
        setCascaderOptions(buildCascaderOptions(groups));
      })
      .catch((err) => {
        if (!handleAuthError(err))
          antMessage.warning('Không tải được danh mục: ' + err.message);
      });
  }, [handleAuthError]);

  // ── Tải danh sách sản phẩm ───────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (p = page, q = search) => {
      setTableLoading(true);
      try {
        const res = await getAdminProducts({ page: p, limit, search: q });
        setProducts(res.data ?? []);
        setTotal(res.total ?? 0);
      } catch (err) {
        if (!handleAuthError(err))
          antMessage.error('Tải danh sách sản phẩm thất bại: ' + err.message);
      } finally {
        setTableLoading(false);
      }
    },
    [page, limit, search, handleAuthError],
  );

  useEffect(() => {
    fetchProducts(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Xử lý ô tìm kiếm ─────────────────────────────────────────────────────
  const onSearchChange = (e) => {
    const q = e.target.value;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(q);
      setPage(1);
      fetchProducts(1, q);
    }, 400);
  };

  // ── Mở modal thêm mới ─────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  // ── Mở modal sửa ─────────────────────────────────────────────────────────
  const openEdit = async (record) => {
    setEditingId(record._id);
    setModalOpen(true);
    try {
      const res = await getAdminProduct(record._id);
      const p = res.data ?? res;
      const groupPath = groupToPath(p.group);
      form.setFieldsValue({
        name: p.name ?? '',
        brand: p.brand ?? '',
        price: p.price ?? 0,
        listPrice: p.listPrice ?? p.list_price ?? p.price ?? 0,
        description: p.description ?? '',
        group: groupPath.length ? groupPath : undefined,
        images: Array.isArray(p.images) && p.images.length
          ? p.images.map((url) => ({ url }))
          : [{ url: '' }],
        specifications: p.specifications
          ? Object.entries(p.specifications).map(([key, value]) => ({ key, value }))
          : [],
      });
    } catch (err) {
      if (!handleAuthError(err)) antMessage.error('Tải sản phẩm thất bại: ' + err.message);
      setModalOpen(false);
    }
  };

  // ── Lưu (tạo / cập nhật) ──────────────────────────────────────────────────
  const onSave = async (values) => {
    setSavingLoading(true);
    try {
      // Chuẩn bị dữ liệu
      const groupStr = Array.isArray(values.group) ? values.group.join('/') : '';
      const images = (values.images ?? [])
        .map((item) => (typeof item === 'object' ? item.url : item))
        .filter(Boolean);
      const specifications = {};
      for (const row of values.specifications ?? []) {
        if (row?.key?.trim()) specifications[row.key.trim()] = String(row.value ?? '');
      }

      const payload = {
        name: values.name?.trim(),
        brand: values.brand?.trim(),
        price: values.price,
        listPrice: values.listPrice,
        description: values.description?.trim(),
        group: groupStr,
        images,
        specifications,
      };

      if (editingId) {
        await updateAdminProduct(editingId, payload);
        antMessage.success('Cập nhật sản phẩm thành công');
      } else {
        await createAdminProduct(payload);
        antMessage.success('Thêm sản phẩm thành công');
      }
      setModalOpen(false);
      fetchProducts(editingId ? page : 1, search);
      if (!editingId) setPage(1);
    } catch (err) {
      if (!handleAuthError(err)) antMessage.error(err.message || 'Lưu thất bại');
    } finally {
      setSavingLoading(false);
    }
  };

  // ── Xóa sản phẩm ─────────────────────────────────────────────────────────
  const onDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAdminProduct(deleteTarget._id);
      antMessage.success('Xóa sản phẩm thành công');
      setDeleteTarget(null);
      // Nếu trang hiện tại trở nên rỗng → lùi 1 trang
      const remaining = total - 1;
      const maxPage = Math.max(1, Math.ceil(remaining / limit));
      const nextPage = Math.min(page, maxPage);
      if (nextPage !== page) setPage(nextPage);
      else fetchProducts(nextPage, search);
    } catch (err) {
      if (!handleAuthError(err)) antMessage.error(err.message || 'Xóa thất bại');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Cột bảng ─────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      width: 64,
      render: (imgs) => {
        const src = Array.isArray(imgs) ? imgs[0] : null;
        return src ? (
          <img src={src} alt="thumb" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4 }} />
        );
      },
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      render: (name) => (
        <Tooltip title={name}>
          <Text
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: 260,
            }}
          >
            {name}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brand',
      width: 120,
      render: (v) => v || '—',
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      width: 130,
      render: (v) => formatVND(v),
    },
    {
      title: 'Danh mục',
      dataIndex: 'group',
      width: 180,
      render: (g) => {
        if (!g) return '—';
        const parts = g.split('/');
        const last = parts[parts.length - 1];
        return (
          <Tooltip title={g}>
            <Text style={{ maxWidth: 160, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {last}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Thao tác',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => setDeleteTarget({ _id: record._id, name: record.name })}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '16px 24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 style={{ margin: 0 }}>Quản lý sản phẩm</h2>
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder="Tìm kiếm tên sản phẩm..."
              onChange={onSearchChange}
              allowClear
              style={{ width: 260 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm sản phẩm
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Bảng */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={products}
        loading={tableLoading}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: false,
          showTotal: (t) => `Tổng ${t} sản phẩm`,
          onChange: (p) => setPage(p),
        }}
      />

      {/* ── Modal Thêm / Sửa ── */}
      <Modal
        title={editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={savingLoading}
        width={760}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSave}
          initialValues={{ images: [{ url: '' }], specifications: [] }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Thương hiệu" name="brand">
                <Input placeholder="Ví dụ: Samsung" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giá bán (VND)"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => v.replace(/,/g, '')}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá gốc / niêm yết (VND)"
                name="listPrice"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const price = getFieldValue('price');
                      if (value != null && price != null && value < price) {
                        return Promise.reject(new Error('Giá niêm yết phải lớn hơn hoặc bằng giá bán'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => v.replace(/,/g, '')}
                  placeholder="Để trống nếu bằng giá bán"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Danh mục" name="group">
            <Cascader
              options={cascaderOptions}
              changeOnSelect
              showSearch
              placeholder="Chọn danh mục"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Mô tả sản phẩm" name="description">
            <TextArea rows={4} placeholder="Nhập mô tả..." />
          </Form.Item>

          {/* Danh sách ảnh */}
          <Form.Item label="Ảnh sản phẩm (URL)">
            <Form.List name="images">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={8} style={{ marginBottom: 8 }} align="middle">
                      <Col flex="auto">
                        <Form.Item {...restField} name={[name, 'url']} noStyle>
                          <Input placeholder="https://..." />
                        </Form.Item>
                      </Col>
                      <Col flex="none">
                        <MinusCircleOutlined
                          onClick={() => remove(name)}
                          style={{ color: '#ff4d4f', fontSize: 18, cursor: 'pointer' }}
                        />
                      </Col>
                      {/* Preview nhỏ */}
                      <Col span={24} style={{ paddingLeft: 0 }}>
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue }) => {
                            const url = getFieldValue(['images', name, 'url']);
                            return url ? (
                              <img
                                src={url}
                                alt="preview"
                                style={{ height: 60, marginTop: 4, borderRadius: 4, objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : null;
                          }}
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                  {fields.length < 10 && (
                    <Button
                      type="dashed"
                      onClick={() => add({ url: '' })}
                      icon={<PlusOutlined />}
                      block
                    >
                      Thêm ảnh
                    </Button>
                  )}
                </>
              )}
            </Form.List>
          </Form.Item>

          {/* Thông số kỹ thuật */}
          <Form.Item label="Thông số kỹ thuật">
            <Form.List name="specifications">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={8} style={{ marginBottom: 8 }} align="middle">
                      <Col span={10}>
                        <Form.Item {...restField} name={[name, 'key']} noStyle>
                          <Input placeholder="Tên thông số (vd: CPU)" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'value']} noStyle>
                          <Input placeholder="Giá trị" />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ textAlign: 'center' }}>
                        <MinusCircleOutlined
                          onClick={() => remove(name)}
                          style={{ color: '#ff4d4f', fontSize: 18, cursor: 'pointer' }}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ key: '', value: '' })}
                    icon={<PlusOutlined />}
                    block
                  >
                    Thêm thông số
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Modal Xác nhận Xóa ── */}
      <Modal
        title="Xác nhận xóa sản phẩm"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={onDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        <p>
          Bạn có chắc muốn xóa sản phẩm{' '}
          <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong> không? Hành động này không
          thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
};

export default AdminProduct;
