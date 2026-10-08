import React, { useState } from "react";
import { Button, Form, Input, Radio } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import Loading from "../../components/LoadingComponent/Loading";
import * as message from "../../components/Message/Message";

const formatPrice = (price) =>
  `${Number(price).toLocaleString("vi-VN")} ₫`;

const PaymentPage = () => {
  const [payment, setPayment] = useState("cod");
  const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    name: "Khách hàng NovaShop",
    phone: "",
    address: "Hà Nội, Việt Nam",
  });

  const [form] = Form.useForm();

  const navigate = useNavigate();
  const location = useLocation();

  // Nhận dữ liệu từ OrderPage
  const { selectedItems = [] } = location.state || {};

  // Tính tổng tiền từ danh sách sản phẩm được chọn
  const totalPrice = selectedItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const handleUpdateShippingInfo = async () => {
    try {
      const values = await form.validateFields();

      setShippingInfo(values);
      setIsOpenModalUpdateInfo(false);

      message.success("Cập nhật thông tin giao hàng thành công");
    } catch (error) {
      // Form chưa hợp lệ
    }
  };

  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
      message.error("Không có sản phẩm để thanh toán");
      return;
    }
  
    const newOrder = {
      id: `NS${Date.now()}`,
      items: selectedItems,
      totalPrice,
      payment,
      shippingInfo,
      status: "Chờ xác nhận",
      createdAt: new Date().toISOString(),
    };
  
    // Lưu đơn hàng
    const orders = JSON.parse(
      localStorage.getItem("novashop_orders") || "[]"
    );
  
    localStorage.setItem(
      "novashop_orders",
      JSON.stringify([newOrder, ...orders])
    );
  
    // Xóa các sản phẩm đã đặt khỏi giỏ hàng
    const cart = JSON.parse(
      localStorage.getItem("novashop_cart") || "[]"
    );
  
    const remainingCart = cart.filter(
      (item) =>
        !selectedItems.some(
          (selected) => selected.productId === item.productId
        )
    );
  
    localStorage.setItem(
      "novashop_cart",
      JSON.stringify(remainingCart)
    );
  
    navigate("/order-success", {
      state: { order: newOrder },
    });
  };

  return (
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        padding: "24px 120px",
        background: "#f5f5fa",
      }}
    >
      <h2>Thanh toán</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
        }}
      >
        {/* BÊN TRÁI: PHƯƠNG THỨC THANH TOÁN */}
        <section
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 6,
            height: "fit-content",
          }}
        >
          <h3>Phương thức giao hàng</h3>

          <p>
            Giao hàng tiêu chuẩn · Dự kiến nhận hàng trong 2–4 ngày
          </p>

          <h3 style={{ marginTop: 24 }}>
            Phương thức thanh toán
          </h3>

          <Radio.Group
            value={payment}
            onChange={(event) => setPayment(event.target.value)}
          >
            <div>
              <Radio value="cod">
                Thanh toán khi nhận hàng
              </Radio>
            </div>

            <div style={{ marginTop: 12 }}>
              <Radio value="card">
                Thẻ ngân hàng / ví điện tử
              </Radio>
            </div>
          </Radio.Group>
        </section>

        {/* BÊN PHẢI: THÔNG TIN ĐƠN HÀNG */}
        <aside
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 6,
            height: "fit-content",
          }}
        >
          <h3>
            Đơn hàng ({selectedItems.length} sản phẩm)
          </h3>

          {/* DANH SÁCH SẢN PHẨM */}
          <div style={{ marginBottom: 20 }}>
            {selectedItems.length === 0 ? (
              <p style={{ color: "#808089" }}>
                Chưa có sản phẩm để thanh toán.
              </p>
            ) : (
              selectedItems.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.name}
                    </div>

                    <div
                      style={{
                        color: "#808089",
                        marginTop: 4,
                        fontSize: 13,
                      }}
                    >
                      Số lượng: {item.quantity}
                    </div>

                    <strong
                      style={{
                        color: "#ff424e",
                        display: "block",
                        marginTop: 4,
                      }}
                    >
                      {formatPrice(
                        Number(item.price) * Number(item.quantity)
                      )}
                    </strong>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* TẠM TÍNH */}
          <p
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Tạm tính</span>
            <b>{formatPrice(totalPrice)}</b>
          </p>

          {/* PHÍ VẬN CHUYỂN */}
          <p
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Vận chuyển</span>
            <b style={{ color: "#00ab56" }}>
              Miễn phí
            </b>
          </p>

          {/* THÔNG TIN GIAO HÀNG */}
          <div style={{ marginTop: 16 }}>
            <strong>Thông tin giao hàng</strong>

            <p style={{ marginTop: 8, marginBottom: 4 }}>
              {shippingInfo.name}
            </p>

            {shippingInfo.phone && (
              <p style={{ marginBottom: 4 }}>
                {shippingInfo.phone}
              </p>
            )}

            <p style={{ marginBottom: 4 }}>
              {shippingInfo.address}
            </p>

            <span
              onClick={() => {
                form.setFieldsValue(shippingInfo);
                setIsOpenModalUpdateInfo(true);
              }}
              style={{
                color: "#9255FD",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Thay đổi
            </span>
          </div>

          <hr
            style={{
              margin: "20px 0",
              border: "none",
              borderTop: "1px solid #eee",
            }}
          />

          {/* TỔNG TIỀN */}
          <p
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Tổng tiền</span>

            <b
              style={{
                color: "#ff424e",
                fontSize: 20,
              }}
            >
              {formatPrice(totalPrice)}
            </b>
          </p>

          {/* NÚT ĐẶT HÀNG */}
          <Button
            type="primary"
            block
            size="large"
            disabled={selectedItems.length === 0}
            onClick={handlePlaceOrder}
            style={{
              marginTop: 16,
              background: "#ff424e",
              borderColor: "#ff424e",
            }}
          >
            Đặt hàng
          </Button>
        </aside>
      </div>

      {/* MODAL CẬP NHẬT THÔNG TIN GIAO HÀNG */}
      <ModalComponent
        title="Cập nhật thông tin giao hàng"
        open={isOpenModalUpdateInfo}
        onCancel={() => setIsOpenModalUpdateInfo(false)}
        onOk={handleUpdateShippingInfo}
      >
        <Loading isLoading={false}>
          <Form
            form={form}
            layout="vertical"
            initialValues={shippingInfo}
          >
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ tên",
                },
              ]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại",
                },
                {
                  pattern: /^0\d{9}$/,
                  message: "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ",
                },
              ]}
            >
              <Input placeholder="Nhập địa chỉ giao hàng" />
            </Form.Item>
          </Form>
        </Loading>
      </ModalComponent>
    </main>
  );
};

export default PaymentPage;