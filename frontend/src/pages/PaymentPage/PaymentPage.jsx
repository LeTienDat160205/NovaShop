import React, { useState } from "react";
import { Button, Form, Input, Radio } from "antd";
import { useNavigate } from "react-router-dom";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import Loading from "../../components/LoadingComponent/Loading";
import * as message from "../../components/Message/Message";

const PaymentPage = () => {
  const [payment, setPayment] = useState("cod");
  const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
  const navigate = useNavigate();

  return (
    <main style={{ minHeight: "calc(100vh - 72px)", padding: "24px 120px", background: "#f5f5fa" }}>
      <h2>Thanh toán</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <section style={{ background: "#fff", padding: 24, borderRadius: 6 }}>
          <h3>Phương thức giao hàng</h3>
          <p>Giao hàng tiêu chuẩn · Dự kiến nhận hàng trong 2–4 ngày</p>
          <h3>Phương thức thanh toán</h3>
          <Radio.Group value={payment} onChange={(event) => setPayment(event.target.value)}>
            <div><Radio value="cod">Thanh toán khi nhận hàng</Radio></div>
            <div style={{ marginTop: 12 }}><Radio value="card">Thẻ ngân hàng / ví điện tử</Radio></div>
          </Radio.Group>
        </section>
        <aside style={{ background: "#fff", padding: 24, borderRadius: 6, height: "fit-content" }}>
          <h3>Đơn hàng</h3>
          <p style={{ display: "flex", justifyContent: "space-between" }}><span>Tạm tính</span><b>200.000 ₫</b></p>
          <p style={{ display: "flex", justifyContent: "space-between" }}><span>Vận chuyển</span><b>Miễn phí</b></p>
          <p>Giao đến: Hà Nội, Việt Nam <span onClick={() => setIsOpenModalUpdateInfo(true)} style={{ color: "#9255FD", cursor: "pointer", marginLeft: 8 }}>Thay đổi</span></p>
          <hr />
          <p style={{ display: "flex", justifyContent: "space-between" }}><span>Tổng tiền</span><b style={{ color: "#ff424e", fontSize: 20 }}>200.000 ₫</b></p>
          <Button type="primary" block size="large" onClick={() => navigate("/order-success")} style={{ background: "#ff424e", borderColor: "#ff424e" }}>Đặt hàng</Button>
        </aside>
      </div>
      <ModalComponent
  title="Cập nhật thông tin giao hàng"
  open={isOpenModalUpdateInfo}
  onCancel={() => setIsOpenModalUpdateInfo(false)}
  onOk={() => {
    message.success("Cập nhật thông tin giao hàng thành công");
    setIsOpenModalUpdateInfo(false);
  }}
>
  <Loading isLoading={false}>
    <Form layout="vertical"><Form.Item label="Họ và tên"><Input defaultValue="Khách hàng NovaShop" /></Form.Item><Form.Item label="Số điện thoại"><Input /></Form.Item><Form.Item label="Địa chỉ"><Input defaultValue="Hà Nội, Việt Nam" /></Form.Item></Form>
  </Loading>
</ModalComponent>
    </main>
  );
};

export default PaymentPage;
