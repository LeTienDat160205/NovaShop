import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';
import { getAuthSession } from '../../utils/authSession';








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


    if (!user) {
        return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
    }


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


    return children;
};

export default AdminRoute;
