import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined, MinusOutlined, PlusOutlined, RightOutlined, ShopOutlined } from "@ant-design/icons";
import { Button, Checkbox, Image, Spin, Empty, message, Space } from "antd";
import * as CartService from "../../services/CartService";
import { clearAuthSession, getAuthSession } from "../../utils/authSession";

const formatPrice = price => `${new Intl.NumberFormat("vi-VN").format(Number(price) || 0)} ₫`;

const OrderPage = () => {
    const [items, setItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingIds, setUpdatingIds] = useState([]);
    const [cartOwnerId, setCartOwnerId] = useState("");
    const cartRequestId = useRef(0);
    const navigate = useNavigate();

    const loadCart = useCallback(async () => {
        const requestId = ++cartRequestId.current;
        const session = getAuthSession();
        if (!session.token || session.role !== "Customer" || !session.userId) {
            setItems([]);
            setSelectedIds([]);
            setCartOwnerId("");
            setLoading(false);
            navigate(!session.token ? "/sign-in" : session.role === "Admin" ? "/system/admin" : "/", { replace: true });
            return;
        }
        const requestedUserId = session.userId;
        try {
            setLoading(true);
            const response = await CartService.getCart();
            const currentSession = getAuthSession();
            if (
                requestId === cartRequestId.current
                && currentSession.userId === requestedUserId
                && currentSession.token
            ) {
                setItems(response?.data || []);
                setSelectedIds([]);
                setCartOwnerId(requestedUserId);
            }
        } catch (error) {
            if (requestId === cartRequestId.current && error.response?.status === 401) {
                message.warning("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
                clearAuthSession();
                navigate("/sign-in", { state: { from: "/order" }, replace: true });
            } else if (requestId === cartRequestId.current && error.response?.status === 403) {
                navigate(getAuthSession().role === "Admin" ? "/system/admin" : "/", { replace: true });
            } else if (requestId === cartRequestId.current) {
                message.error(error.response?.data?.message || "Không thể tải giỏ hàng.");
            }
        } finally {
            if (requestId === cartRequestId.current) setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const initialLoad = window.setTimeout(loadCart, 0);
        window.addEventListener("novashop-auth-changed", loadCart);
        window.addEventListener("storage", loadCart);
        return () => {
            window.clearTimeout(initialLoad);
            cartRequestId.current += 1;
            window.removeEventListener("novashop-auth-changed", loadCart);
            window.removeEventListener("storage", loadCart);
        };
    }, [loadCart]);

    const updateQuantity = async (productId, quantity) => {
        const nextQuantity = Math.max(1, Math.min(99, Number(quantity) || 1));
        setUpdatingIds(prev => [...prev, productId]);

        try {
            await CartService.updateCartQuantity(productId, nextQuantity);
            setItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: nextQuantity } : item));
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể cập nhật số lượng.");
        } finally {
            setUpdatingIds(prev => prev.filter(id => id !== productId));
        }
    };

    const removeItem = async productId => {
        try {
            await CartService.removeCartItem(productId);
            setItems(prev => prev.filter(item => item.productId !== productId));
            setSelectedIds(prev => prev.filter(id => id !== productId));
            message.success("Đã xóa sản phẩm khỏi giỏ hàng.");
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể xóa sản phẩm.");
        }
    };

    const selectedItems = useMemo(() => items.filter(item => selectedIds.includes(item.productId)), [items, selectedIds]);
    const totalPrice = useMemo(() => selectedItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0), [selectedItems]);
    const allSelected = items.length > 0 && items.every(item => selectedIds.includes(item.productId));
    const someSelected = items.some(item => selectedIds.includes(item.productId));

    const handleSelectItem = (productId, checked) => {
        setSelectedIds(prev => checked ? [...new Set([...prev, productId])] : prev.filter(id => id !== productId));
    };

    const handleSelectAll = checked => {
        setSelectedIds(checked ? items.map(item => item.productId) : []);
    };

    const openProduct = productId => {
        if (productId) navigate(`/product-details/${productId}`);
    };

    const handleCheckout = () => {
        if (!selectedItems.length) {
            message.warning("Vui lòng chọn ít nhất một sản phẩm để mua hàng.");
            return;
        }
        const token = localStorage.getItem("novashop_token");
        const session = getAuthSession();
        if (!token || !session.userId) {
            message.warning("Vui lòng đăng nhập lại trước khi thanh toán.");
            navigate("/sign-in", { state: { from: "/order" }, replace: true });
            return;
        }
        if (session.role !== "Customer") {
            message.warning("Chỉ tài khoản khách hàng mới có thể đặt hàng.");
            navigate(session.role === "Admin" ? "/system/admin" : "/", { replace: true });
            return;
        }
        if (session.userId !== cartOwnerId) {
            message.warning("Tài khoản vừa thay đổi. Vui lòng tải lại giỏ hàng trước khi thanh toán.");
            setItems([]);
            setSelectedIds([]);
            setCartOwnerId("");
            return;
        }
        navigate("/payment", { state: { selectedItems, totalPrice, checkoutUserId: session.userId } });
    };

    if (loading) {
        return <div style={{ minHeight: 400, display: "flex", justifyContent: "center", alignItems: "center" }}><Spin size="large" tip="Đang tải giỏ hàng..." /></div>;
    }

    const cardStyle = { background: "#fff", borderRadius: 8, marginBottom: 12, overflow: "hidden" };
    const mutedText = { color: "#808089", fontSize: 14 };

    return (
        <main style={{ minHeight: "calc(100vh - 76px)", background: "#f5f5fa", padding: "20px clamp(12px, 3vw, 40px) 40px", color: "#27272a" }}>
            <div style={{ fontSize: 13, marginBottom: 16, color: "#808089" }}>
                <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Trang chủ</span>
                {" "}<RightOutlined style={{ fontSize: 10 }} />{" "}
                <span style={{ color: "#27272a" }}>Giỏ hàng</span>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>GIỎ HÀNG</h2>

            {items.length === 0 ? (
                <div style={{ ...cardStyle, padding: "60px 20px", textAlign: "center" }}>
                    <Empty description="Giỏ hàng của bạn đang trống">
                        <Space wrap>
                            <Button type="primary" onClick={() => navigate("/")}>Tiếp tục mua sắm</Button>
                            <Button onClick={() => navigate("/my-order")}>Xem đơn hàng của tôi</Button>
                        </Space>
                    </Empty>
                </div>
            ) : (
                <div className="cart-layout">
                    <section style={{ minWidth: 0 }}>
                        <div style={{ ...cardStyle, padding: "16px 20px" }}>
                            <div className="cart-columns">
                                <div><Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={e => handleSelectAll(e.target.checked)}>Tất cả ({items.length} sản phẩm)</Checkbox></div>
                                <div style={mutedText}>Đơn giá</div>
                                <div style={mutedText}>Số lượng</div>
                                <div style={mutedText}>Thành tiền</div>
                                <div style={{ textAlign: "center" }}>
                                    <DeleteOutlined title="Xóa các sản phẩm đã chọn" style={{ color: "#808089", cursor: "pointer", fontSize: 18 }} onClick={async () => {
                                        if (!selectedIds.length) return message.warning("Vui lòng chọn sản phẩm cần xóa.");
                                        for (const id of selectedIds) await removeItem(id);
                                    }} />
                                </div>
                            </div>
                        </div>

                        <div style={cardStyle}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f2f2f2", fontSize: 15, fontWeight: 500 }}>
                                <ShopOutlined style={{ color: "#808089", marginRight: 8 }} /> NovaShop <RightOutlined style={{ fontSize: 11, color: "#808089" }} />
                            </div>

                            {items.map(item => (
                                <div key={item.productId} className="cart-product">
                                    <div className="cart-product-main">
                                        <Checkbox checked={selectedIds.includes(item.productId)} onChange={e => handleSelectItem(item.productId, e.target.checked)} />

                                        <div className="cart-product-image" onClick={() => openProduct(item.productId)} title="Xem chi tiết sản phẩm">
                                            <Image src={item.image || item.images?.[0] || "https://via.placeholder.com/100"} alt={item.name} preview={false} width={100} height={100} style={{ objectFit: "contain" }} />
                                        </div>

                                        <div className="cart-product-info">
                                            <div className="cart-product-name" onClick={() => openProduct(item.productId)} title="Xem chi tiết sản phẩm">{item.name}</div>
                                            <div style={{ color: "#fa8c16", fontSize: 13, marginTop: 6 }}>Sản phẩm NovaShop</div>
                                        </div>

                                        <div className="cart-unit-price">
                                            <strong>{formatPrice(item.price)}</strong>
                                            {item.listPrice > item.price && <div style={{ color: "#808089", fontSize: 12, textDecoration: "line-through", marginTop: 4 }}>{formatPrice(item.listPrice)}</div>}
                                        </div>

                                        <div className="cart-quantity">
                                            <Button size="small" icon={<MinusOutlined />} disabled={item.quantity <= 1 || updatingIds.includes(item.productId)} onClick={() => updateQuantity(item.productId, item.quantity - 1)} />
                                            <span>{item.quantity}</span>
                                            <Button size="small" icon={<PlusOutlined />} disabled={item.quantity >= 99 || updatingIds.includes(item.productId)} onClick={() => updateQuantity(item.productId, item.quantity + 1)} />
                                        </div>

                                        <div className="cart-line-total">{formatPrice(Number(item.price) * Number(item.quantity))}</div>

                                        <div className="cart-delete">
                                            <DeleteOutlined title="Xóa sản phẩm" onClick={() => removeItem(item.productId)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button icon={<ShopOutlined />} onClick={() => navigate("/")} style={{ marginBottom: 16 }}>Tiếp tục mua sắm</Button>
                    </section>

                    <aside className="cart-summary">
                        <h3 style={{ fontSize: 17, margin: "0 0 20px" }}>Tổng kết đơn hàng</h3>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                            <span style={mutedText}>Tổng tiền hàng</span><span>{formatPrice(totalPrice)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                            <span style={mutedText}>Giảm giá</span><span style={{ color: "#00ab56" }}>0 ₫</span>
                        </div>
                        <div style={{ borderTop: "1px solid #ebebf0", paddingTop: 18, display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <strong>Tổng thanh toán</strong>
                            <strong style={{ color: "#ff424e", fontSize: 20 }}>{formatPrice(totalPrice)}</strong>
                        </div>
                        <div style={{ color: "#808089", fontSize: 12, marginTop: 8, textAlign: "right" }}>Chưa bao gồm phí vận chuyển</div>
                        <Button type="primary" block size="large" onClick={handleCheckout} disabled={!selectedItems.length} style={{ marginTop: 20, height: 46, background: "#ff424e", borderColor: "#ff424e" }}>
                            Mua hàng ({selectedItems.length})
                        </Button>
                    </aside>
                </div>
            )}

            <style>{`
                .cart-layout { display: grid; grid-template-columns: minmax(0, 1fr) 310px; gap: 20px; align-items: start; }
                .cart-columns { display: grid; grid-template-columns: minmax(220px, 1fr) 120px 120px 130px 28px; gap: 12px; align-items: center; }
                .cart-columns > div:not(:first-child) { text-align: center; }
                .cart-product { padding: 20px; border-bottom: 1px solid #f2f2f2; }
                .cart-product:last-child { border-bottom: none; }
                .cart-product-main { display: grid; grid-template-columns: 24px 100px minmax(120px, 1fr) 120px 120px 130px 24px; gap: 12px; align-items: center; }
                .cart-product-image { display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; }
                .cart-product-name { font-size: 15px; line-height: 1.5; cursor: pointer; }
                .cart-product-name:hover { color: #1677ff; }
                .cart-unit-price { text-align: center; }
                .cart-unit-price strong, .cart-line-total { color: #ff424e; font-size: 15px; font-weight: 600; }
                .cart-quantity { display: flex; align-items: center; justify-content: center; }
                .cart-quantity > span { min-width: 32px; text-align: center; }
                .cart-line-total { text-align: center; }
                .cart-delete { text-align: center; color: #808089; cursor: pointer; font-size: 17px; }
                .cart-summary { background: #fff; border-radius: 8px; padding: 20px; position: sticky; top: 90px; }
                @media (max-width: 1100px) {
                    .cart-layout { grid-template-columns: minmax(0, 1fr); }
                    .cart-summary { position: static; }
                }
                @media (max-width: 760px) {
                    .cart-columns { grid-template-columns: 1fr 24px; }
                    .cart-columns > div:nth-child(2), .cart-columns > div:nth-child(3), .cart-columns > div:nth-child(4) { display: none; }
                    .cart-product { padding: 14px 10px; }
                    .cart-product-main { grid-template-columns: 22px 76px minmax(0, 1fr) 24px; gap: 8px; }
                    .cart-product-image img { max-width: 76px; max-height: 76px; }
                    .cart-product-info { grid-column: 3; }
                    .cart-unit-price { grid-column: 3; text-align: left; }
                    .cart-quantity { grid-column: 2 / 4; justify-content: flex-start; }
                    .cart-line-total { grid-column: 3; text-align: left; }
                    .cart-delete { grid-column: 4; grid-row: 1; }
                }
            `}</style>
        </main>
    );
};

export default OrderPage;