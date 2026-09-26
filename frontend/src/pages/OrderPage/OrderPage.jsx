import React, { useMemo, useState } from "react";
import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Image } from "antd";
import productImage from "../../assets/images/test.webp";

const initialItems = [
  {
    id: 1,
    name: "Sách Thám tử lừng danh Conan - Bản đặc biệt",
    shop: "Nhà sách Nova",
    price: 200000,
    quantity: 1,
    image: productImage,
  },
  {
    id: 2,
    name: "Combo sách kỹ năng sống tuyển chọn",
    shop: "Nhà sách Nova",
    price: 145000,
    quantity: 2,
    image: productImage,
  },
];

const formatPrice = (price) =>
  `${new Intl.NumberFormat("vi-VN").format(price)} ₫`;

const OrderPage = () => {
  const [items, setItems] = useState(initialItems);

  const updateQuantity = (id, value) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + value) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  const temporaryPrice = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  return (
    <div
      style={{
        minHeight: "calc(100vh - 76px)",
        background: "#f5f5fa",
        padding: "20px 120px 40px",
      }}
    >
      <div style={{ fontSize: "13px", marginBottom: "16px", color: "#808089" }}>
        Trang chủ <RightOutlined style={{ fontSize: "10px" }} /> Giỏ hàng
      </div>

      <h2 style={{ fontSize: "20px", marginBottom: "18px" }}>
        Giỏ hàng ({items.length} sản phẩm)
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: "20px" }}>
        <div>
          <div
            style={{
              background: "#fff",
              borderRadius: "4px",
              padding: "14px 16px",
              marginBottom: "12px",
            }}
          >
            <Checkbox>Chọn tất cả ({items.length})</Checkbox>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: "4px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div style={{ marginBottom: "14px", fontSize: "14px", fontWeight: 500 }}>
                <Checkbox>{item.shop}</Checkbox>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "34px 100px 1fr 145px 115px 32px", gap: "12px", alignItems: "center" }}>
                <Checkbox />

                <Image
                  src={item.image}
                  preview={false}
                  width={90}
                  height={90}
                  style={{ objectFit: "cover" }}
                />

                <div>
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.45 }}>
                    {item.name}
                  </p>
                  <span style={{ color: "#808089", fontSize: "12px" }}>
                    Giao hàng tiêu chuẩn
                  </span>
                </div>

                <strong style={{ color: "#ff424e", fontSize: "15px" }}>
                  {formatPrice(item.price)}
                </strong>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    size="small"
                    icon={<MinusOutlined />}
                    onClick={() => updateQuantity(item.id, -1)}
                  />
                  <span
                    style={{
                      width: "36px",
                      textAlign: "center",
                      borderTop: "1px solid #d9d9d9",
                      borderBottom: "1px solid #d9d9d9",
                      height: "24px",
                      lineHeight: "24px",
                    }}
                  >
                    {item.quantity}
                  </span>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => updateQuantity(item.id, 1)}
                  />
                </div>

                <DeleteOutlined
                  onClick={() => removeItem(item.id)}
                  style={{ color: "#808089", cursor: "pointer" }}
                />
              </div>
            </div>
          ))}
        </div>

        <aside style={{ height: "fit-content", background: "#fff", borderRadius: "4px" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #ebebf0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#808089" }}>Tạm tính</span>
              <span>{formatPrice(temporaryPrice)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "12px",
              }}
            >
              <span style={{ color: "#808089" }}>Phí vận chuyển</span>
              <span style={{ color: "#00ab56" }}>Miễn phí</span>
            </div>
          </div>

          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
              <span style={{ color: "#808089" }}>Tổng tiền</span>
              <div style={{ textAlign: "right" }}>
                <strong style={{ color: "#ff424e", fontSize: "22px" }}>
                  {formatPrice(temporaryPrice)}
                </strong>
                <div style={{ color: "#808089", fontSize: "12px" }}>
                  Đã bao gồm VAT
                </div>
              </div>
            </div>

            <Button
              type="primary"
              block
              size="large"
              disabled={!items.length}
              style={{
                marginTop: "16px",
                background: "#ff424e",
                borderColor: "#ff424e",
              }}
            >
              Mua hàng
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderPage 
