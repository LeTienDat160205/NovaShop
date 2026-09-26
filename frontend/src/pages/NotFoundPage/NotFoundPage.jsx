import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #e6f4ff, #f5f5fa)" }}>
      <Result status="404" title="404" subTitle="Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển đi." extra={<Button type="primary" size="large" onClick={() => navigate("/")}>Về trang chủ</Button>} />
    </main>
  );
};

export default NotFoundPage;
