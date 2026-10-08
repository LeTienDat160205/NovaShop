import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Image } from "antd";


const formatPrice = (price) =>
  `${new Intl.NumberFormat("vi-VN").format(price)} ₫`;

const OrderPage = () => {
  const [items, setItems] = useState(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("novashop_cart") || "[]"
      );

      return Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
      console.error("Lỗi đọc giỏ hàng:", error);
      return [];
    }
  });

  // State quản lý sản phẩm được chọn
  const [selectedIds, setSelectedIds] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("novashop_cart", JSON.stringify(items));
  }, [items]);

  const updateQuantity = (productId, value) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? {
            ...item,
            quantity: Math.max(1, item.quantity + value),
          }
          : item
      )
    );
  };

  const removeItem = (productId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );

    setSelectedIds((prev) =>
      prev.filter((id) => id !== productId)
    );
  };

  const temporaryPrice = useMemo(() => {
    return items
      .filter((item) => selectedIds.includes(item.productId))
      .reduce(
        (total, item) =>
          total + Number(item.price) * Number(item.quantity),
        0
      );
  }, [items, selectedIds]);

  const handleSelectItem = (productId, checked) => {
    setSelectedIds((prev) =>
      checked
        ? [...new Set([...prev, productId])]
        : prev.filter((id) => id !== productId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? items.map((item) => item.productId) : []);
  };

  const allSelected =
    items.length > 0 &&
    items.every((item) => selectedIds.includes(item.productId));

  const someSelected = items.some((item) =>
    selectedIds.includes(item.productId)
  );

  const handleCheckout = () => {
    const selectedItems = items.filter((item) =>
      selectedIds.includes(item.productId)
    );

    if (selectedItems.length === 0) {
      return;
    }

    navigate("/payment", {
      state: {
        selectedItems,
        totalPrice: temporaryPrice,
      },
    });
  };

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
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              Chọn tất cả ({items.length})
            </Checkbox>
          </div>

          {items.map((item) => (
            <div
              key={item.productId}
              style={{
                background: "#fff",
                borderRadius: "4px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div style={{ marginBottom: "14px", fontSize: "14px", fontWeight: 500 }}>
                <strong style={{ fontSize: 14 }}>NovaShop</strong>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "34px 100px 1fr 145px 115px 32px", gap: "12px", alignItems: "center" }}>
                <Checkbox
                  checked={selectedIds.includes(item.productId)}
                  onChange={(e) =>
                    handleSelectItem(item.productId, e.target.checked)}
                />

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
                    onClick={() => updateQuantity(item.productId, -1)}
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
                    onClick={() => updateQuantity(item.productId, 1)}
                  />
                </div>

                <DeleteOutlined
                  onClick={() => removeItem(item.productId)}
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
              onClick={handleCheckout}
              disabled={!items.some((item) => selectedIds.includes(item.productId))}
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
