import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const API_URL = "http://localhost:3001/api/admin/users";

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getToken = () => localStorage.getItem("novashop_token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const getUsers = async () => {
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể tải danh sách tài khoản");
      }

      setUsers(result.data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const updateRole = async (user, role) => {
    setUpdatingId(user._id);

    try {
      const response = await fetch(`${API_URL}/${user._id}/role`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ role }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Cập nhật quyền thất bại");
      }

      message.success("Cập nhật quyền thành công");
      await getUsers();
    } catch (error) {
      message.error(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = (user) => {
    Modal.confirm({
      title: "Xác nhận xóa tài khoản",
      content: `Bạn có chắc muốn xóa tài khoản "${user.name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        setDeletingId(user._id);

        try {
          const response = await fetch(`${API_URL}/${user._id}`, {
            method: "DELETE",
            headers: getHeaders(),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || "Xóa tài khoản thất bại");
          }

          message.success("Xóa tài khoản thành công");
          await getUsers();
        } catch (error) {
          message.error(error.message);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("novashop_user") || "null");
    } catch {
      return null;
    }
  })();

  const currentUserId = String(currentUser?.id || currentUser?._id || "");

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "Chưa cập nhật",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => address || "Chưa cập nhật",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "Admin" ? "blue" : "green"}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Phân quyền",
      key: "permissions",
      render: (_, user) => {
        const isSelf = String(user._id) === currentUserId;

        return (
          <Select
            value={user.role}
            style={{ width: 130 }}
            loading={updatingId === user._id}
            disabled={isSelf || updatingId === user._id}
            onChange={(role) => updateRole(user, role)}
            options={[
              { value: "Customer", label: "Customer" },
              { value: "Admin", label: "Admin" },
            ]}
          />
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, user) => {
        const isSelf = String(user._id) === currentUserId;

        return (
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === user._id}
            disabled={isSelf || user.role === "Admin"}
            onClick={() => confirmDelete(user)}
          >
            Xóa
          </Button>
        );
      },
    },
  ];

  const filteredUsers = users.filter((user) => {
    const keyword = searchText.trim().toLowerCase();

    return (
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <Title level={3}>Quản lý tài khoản</Title>

      <Space
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          placeholder="Tìm theo tên hoặc email..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={getUsers}
          loading={loading}
        >
          Làm mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default AdminUser;