import React from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';

/**
 * Guard kiểm tra quyền Admin trên giao diện frontend.
 * GHI CHÚ QUAN TRỌNG:
 * Đây chỉ là lớp chặn giao diện (UI) để cải thiện trải nghiệm người dùng.
 * Cơ chế bảo vệ và phân quyền thực sự tuyệt đối nằm ở server backend
 * thông qua authMiddleware.requireAdmin.
 */
const AdminRoute = ({ children }) => {
    let user = null;
    try {
        const rawUser = localStorage.getItem('novashop_user');
        if (rawUser) {
            user = JSON.parse(rawUser);
        }
    } catch (err) {
        user = null;
    }

    // Chưa đăng nhập -> chuyển hướng về trang đăng nhập
    if (!user) {
        return <Navigate to="/sign-in" replace />;
    }

    // Đã đăng nhập nhưng không phải Admin -> hiện trang thông báo 403
    if (user.role !== 'Admin') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Result
                    status="403"
                    title="403"
                    subTitle="Bạn không có quyền truy cập vào trang quản trị này."
                    extra={
                        <Button type="primary" onClick={() => (window.location.href = '/')}>
                            Về trang chủ
                        </Button>
                    }
                />
            </div>
        );
    }

    // Role hợp lệ (Admin) -> hiển thị nội dung bên trong
    return children;
};

export default AdminRoute;
