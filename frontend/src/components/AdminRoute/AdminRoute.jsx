import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';
import { getAuthSession } from '../../utils/authSession';

/**
 * Guard kiểm tra quyền Admin trên giao diện frontend.
 * GHI CHÚ QUAN TRỌNG:
 * Đây chỉ là lớp chặn giao diện (UI) để cải thiện trải nghiệm người dùng.
 * Cơ chế bảo vệ và phân quyền thực sự tuyệt đối nằm ở server backend
 * thông qua authMiddleware.requireAdmin.
 */
const readSessionUser = () => {
    const session = getAuthSession();
    return session.token && session.userId && session.role ? session.user : null;
};

const AdminRoute = ({ children }) => {
    const location = useLocation();
    const [user, setUser] = useState(readSessionUser);

    useEffect(() => {
        const syncSession = () => setUser(readSessionUser());
        window.addEventListener('novashop-auth-changed', syncSession);
        window.addEventListener('storage', syncSession);
        return () => {
            window.removeEventListener('novashop-auth-changed', syncSession);
            window.removeEventListener('storage', syncSession);
        };
    }, []);

    // Chưa đăng nhập -> chuyển hướng về trang đăng nhập
    if (!user) {
        return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
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
