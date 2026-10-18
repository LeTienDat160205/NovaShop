
import { useEffect, useState } from "react";
import { Button, Form, Input, Radio, Empty } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import * as message from "../../components/Message/Message";
import { createOrder } from "../../services/AdminService";
import { clearAuthSession, getAuthSession } from "../../utils/authSession";

const formatPrice = (price) => `${Number(price || 0).toLocaleString("vi-VN")} ₫`;

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [payment, setPayment] = useState("cod");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
    const [form] = Form.useForm();

    const selectedItems = Array.isArray(location.state?.selectedItems)
        ? location.state.selectedItems
        : [];
    const checkoutUserId = location.state?.checkoutUserId;
    const session = getAuthSession();
    const checkoutSessionValid = Boolean(
        session.token
        && checkoutUserId
        && String(checkoutUserId) === session.userId
        && session.role === "Customer"
    );

    useEffect(() => {
        const verifyCheckoutSession = () => {
            const currentSession = getAuthSession();
            if (
                !currentSession.token
                || !checkoutUserId
                || currentSession.userId !== String(checkoutUserId)
                || currentSession.role !== "Customer"
            ) {
                message.warning("Tài khoản thanh toán đã thay đổi. Vui lòng bắt đầu lại.");
                const destination = !currentSession.token
                    ? "/sign-in"
                    : currentSession.role === "Admin"
                        ? "/system/admin"
                        : "/order";
                navigate(destination, { replace: true, state: { from: "/order" } });
            }
        };

        verifyCheckoutSession();
        window.addEventListener("novashop-auth-changed", verifyCheckoutSession);
        window.addEventListener("storage", verifyCheckoutSession);
        return () => {
            window.removeEventListener("novashop-auth-changed", verifyCheckoutSession);
            window.removeEventListener("storage", verifyCheckoutSession);
        };
    }, [checkoutUserId, navigate]);

    const [shippingInfo, setShippingInfo] = useState(() => {
        try {
            const user = JSON.parse(localStorage.getItem("novashop_user") || "null");
            return {
                name: user?.name || "Khách hàng NovaShop",
                phone: user?.phone || "",
                address: user?.address || "",
            };
        } catch {
            return { name: "Khách hàng NovaShop", phone: "", address: "" };
        }
    });

    const totalPrice = selectedItems.reduce(
        (total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0
    );

    const handleUpdateShippingInfo = async () => {
        try {
            const values = await form.validateFields();
            setShippingInfo(values);
            setIsOpenModalUpdateInfo(false);
            message.success("Cập nhật thông tin giao hàng thành công");
        } catch {
            // Form không hợp lệ, giữ nguyên modal để người dùng sửa.
        }
    };

    const handlePlaceOrder = async () => {
        const currentSession = getAuthSession();
        if (
            !currentSession.token
            || !checkoutUserId
            || currentSession.userId !== String(checkoutUserId)
            || currentSession.role !== "Customer"
        ) {
            message.error("Phiên thanh toán không hợp lệ. Vui lòng quay lại giỏ hàng.");
            navigate(currentSession.role === "Admin" ? "/system/admin" : "/order", { replace: true });
            return;
        }
        if (!selectedItems.length) {
            message.error("Không có sản phẩm để thanh toán");
            return;
        }
        if (
            selectedItems.some(item =>
                !/^[a-f\d]{24}$/i.test(String(item.productId || ""))
                || !Number.isInteger(Number(item.quantity))
                || Number(item.quantity) < 1
                || Number(item.quantity) > 99
            )
        ) {
            message.error("Thông tin sản phẩm không hợp lệ. Vui lòng tải lại giỏ hàng.");
            navigate("/order", { replace: true });
            return;
        }
        if (
            !shippingInfo.name?.trim()
            || shippingInfo.name.trim().length > 100
            || !shippingInfo.address?.trim()
            || shippingInfo.address.trim().length > 300
            || !/^(0\d{9}|\+84\d{9})$/.test(shippingInfo.phone?.trim() || "")
        ) {
            message.error("Vui lòng kiểm tra lại tên, số điện thoại và địa chỉ giao hàng.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createOrder({
                checkoutUserId: String(checkoutUserId),
                items: selectedItems.map(item => ({
                    productId: item.productId,
                    quantity: Number(item.quantity || 1),
                })),
                shippingName: shippingInfo.name,
                shippingPhone: shippingInfo.phone,
                shippingAddress: shippingInfo.address,
                paymentMethod: payment === "cod" ? "COD" : "CARD",
            });
            navigate("/order-success", { state: { orderId: result.data?.id } });
        } catch (error) {
            message.error(error.message || "Không thể tạo đơn hàng.");
            if (error.status === 401) {
                clearAuthSession();
                navigate("/sign-in", { replace: true });
            } else if (error.status === 403) {
                const currentSession = getAuthSession();
                navigate(currentSession.role === "Admin" ? "/system/admin" : "/order", { replace: true });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const cardStyle = {
        background: "#fff", borderRadius: 8, padding: 24,
        marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    };

    return (


        <main style={{ minHeight: "calc(100vh - 76px)", background: "#f5f5fa", padding: "20px clamp(12px, 3vw, 40px) 40px", color: "#27272a" }}>
            <div style={{ width: "100%" }}>
                <Button type="default" icon={<ArrowLeftOutlined />} onClick={() => navigate("/order")} style={{ marginBottom: 20 }}>
                  Quay lại giỏ hàng
                </Button>

                <h2 style={{ marginBottom: 24 }}>THANH TOÁN</h2>

                {!selectedItems.length ? (
                    <div style={cardStyle}>
                        <Empty description="Chưa có sản phẩm để thanh toán">
                            <Button type="primary" onClick={() => navigate("/order")}>Quay lại giỏ hàng</Button>
                        </Empty>
                    </div>
                ) : (
                    <div className="payment-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 6.5fr) minmax(350px, 3.5fr)", gap: 28, alignItems: "start" }}>
                        <div>
                            {/* ĐỊA CHỈ NHẬN HÀNG */}
                            <section style={cardStyle}>
                                <h3 style={{ marginTop: 0, marginBottom: 18 }}>
                                    <EnvironmentOutlined style={{ color: "#9255fd", marginRight: 8 }} />
                                    Thông tin giao hàng
                                </h3>

                                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                            {shippingInfo.name}
                                            {shippingInfo.phone && <span style={{ marginLeft: 12, fontWeight: 400 }}>{shippingInfo.phone}</span>}
                                        </div>
                                        <div style={{ color: "#595959", lineHeight: 1.7 }}>{shippingInfo.address}</div>
                                    </div>
                                    <Button icon={<EditOutlined />} onClick={() => {
                                        form.setFieldsValue(shippingInfo);
                                        setIsOpenModalUpdateInfo(true);
                                    }}>
                                        Thay đổi
                                    </Button>
                                </div>
                            </section>

                            {/* PHƯƠNG THỨC GIAO HÀNG */}
                            <section style={cardStyle}>
                                <h3 style={{ marginTop: 0 }}>Phương thức giao hàng</h3>
                                <Radio checked style={{ display: "flex", alignItems: "flex-start", whiteSpace: "normal" }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>Giao hàng tiêu chuẩn</div>
                                        <div style={{ color: "#808089", fontSize: 13, marginTop: 4 }}>
                                            Dự kiến nhận hàng trong 2–4 ngày
                                        </div>
                                    </div>
                                </Radio>
                                <div style={{ marginTop: 16, color: "#00a650" }}>Miễn phí vận chuyển</div>
                            </section>

                            {/* PHƯƠNG THỨC THANH TOÁN */}
                            <section style={cardStyle}>
                                <h3 style={{ marginTop: 0, marginBottom: 20 }}>Phương thức thanh toán</h3>
                                <Radio.Group value={payment} onChange={(event) => setPayment(event.target.value)} style={{ width: "100%" }}>
                                    <div style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                                        <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
                                    </div>
                                    <div style={{ padding: "16px 0 4px" }}>
                                        <Radio value="card">Thẻ ngân hàng / ví điện tử</Radio>
                                    </div>
                                </Radio.Group>
                            </section>
                        </div>

                        {/* TÓM TẮT ĐƠN HÀNG */}
                        <aside style={{ ...cardStyle, position: "sticky", top: 16 }}>
                            <h3 style={{ marginTop: 0 }}>Đơn hàng ({selectedItems.length} sản phẩm)</h3>

                            <div style={{ maxHeight: 360, overflowY: "auto" }}>
                                {selectedItems.map((item, index) => {
                                    const image = item.image || item.images?.[0] || item.product?.images?.[0] || "";
                                    const name = item.name || item.product?.name || "Sản phẩm";
                                    const key = item.productId || item._id || item.id || index;

                                    return (
                                        <div key={key} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #eee" }}>
                                            {image ? (
                                                <img src={image} alt={name} style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 6, border: "1px solid #f0f0f0" }} />
                                            ) : (
                                                <div style={{ width: 64, height: 64, background: "#f5f5f5", borderRadius: 6 }} />
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 14, lineHeight: 1.5, overflowWrap: "anywhere" }}>{name}</div>
                                                <div style={{ color: "#808089", fontSize: 13, marginTop: 4 }}>Số lượng: {item.quantity || 1}</div>
                                                <strong style={{ color: "#ee4d2d", display: "block", marginTop: 5 }}>
                                                    {formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
                                                </strong>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: 20, borderBottom: "1px solid #eee", paddingBottom: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Phí vận chuyển</span>
                                    <span style={{ color: "#00a650" }}>Miễn phí</span>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 20 }}>
                                <span>Tổng tiền</span>
                                <strong style={{ color: "#ee4d2d", fontSize: 22 }}>{formatPrice(totalPrice)}</strong>
                            </div>

                            <div style={{ color: "#808089", fontSize: 12, marginTop: 8 }}>
                                Đã bao gồm thuế VAT nếu có.
                            </div>

                            <Button type="primary" block size="large" onClick={handlePlaceOrder} loading={isSubmitting} disabled={!checkoutSessionValid}
                                style={{ marginTop: 20, height: 46, background: "#ee4d2d", borderColor: "#ee4d2d" }}>
                                Đặt hàng
                            </Button>

                            <Button block style={{ marginTop: 10 }} onClick={() => navigate("/")}>
                                Tiếp tục mua sắm
                            </Button>
                        </aside>
                    </div>
                )}
            </div>

            {/* MODAL CHỈNH SỬA ĐỊA CHỈ */}
            <ModalComponent
                title="Cập nhật thông tin giao hàng"
                open={isOpenModalUpdateInfo}
                onCancel={() => setIsOpenModalUpdateInfo(false)}
                onOk={handleUpdateShippingInfo}
            >
                <Form form={form} layout="vertical" initialValues={shippingInfo}>
                    <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                        <Input placeholder="Nhập họ và tên" maxLength={100} />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone" rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại" },
                        { pattern: /^(0\d{9}|\+84\d{9})$/, message: "Nhập số 0xxxxxxxxx hoặc +84xxxxxxxxx hợp lệ" }
                    ]}>
                        <Input placeholder="Nhập số điện thoại" maxLength={10} />
                    </Form.Item>
                    <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
                        <Input.TextArea placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" rows={3} maxLength={300} />
                    </Form.Item>
                </Form>
            </ModalComponent>

            <style>{`
                @media (max-width: 850px) {
                    .payment-layout { grid-template-columns: minmax(0, 1fr) !important; }
                }
            `}</style>
        </main>
    );
};

export default PaymentPage;
