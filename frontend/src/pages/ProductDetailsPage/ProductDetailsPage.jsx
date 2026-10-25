import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import * as ProductService from "../../services/ProductService";
import * as CartService from "../../services/CartService";
import ProductDetailsComponent from '../../components/ProductDetailsComponent/ProductDetailsComponent';
import { getMockProductDetail } from '../../data/mockProductDetail';
import { getAuthSession } from '../../utils/authSession';

const USE_MOCK_FALLBACK = false;

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await ProductService.getDetailsProduct(id);
                if (response?.status === "OK" && response.data) {
                    setProduct(response.data);
                } else {
                    setProduct(USE_MOCK_FALLBACK ? getMockProductDetail(id) : null);
                }
            } catch {
                setProduct(USE_MOCK_FALLBACK ? getMockProductDetail(id) : null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const requireLogin = () => {
        if (localStorage.getItem('novashop_token')) return true;
        message.warning('Vui lòng đăng nhập để tiếp tục.');
        navigate('/sign-in', { state: { from: `/product-details/${id}` } });
        return false;
    };

    const handleAddToCart = async ({ productId, quantity }) => {
        if (!requireLogin()) return;
        if (!product?._id || !productId) {
            message.error('Không tìm thấy sản phẩm hợp lệ trong cơ sở dữ liệu.');
            return;
        }

        try {
            await CartService.addToCart(product._id, Number(quantity) || 1);
            message.success('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (error) {
            if (error.response?.status === 401) {
                message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                navigate('/sign-in');
            } else {
                message.error(error.response?.data?.message || error.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
            }
        }
    };

    const handleBuyNow = async ({ productId, quantity }) => {
        if (!requireLogin()) return;
        if (!product?._id || !productId) {
            message.error('Không tìm thấy sản phẩm hợp lệ trong cơ sở dữ liệu.');
            return;
        }

        const selectedQuantity = Number(quantity) || 1;
        try {
            await CartService.addToCart(product._id, selectedQuantity);
        } catch (error) {
            if (error.response?.status === 401) {
                message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                navigate('/sign-in');
            } else {
                message.error(error.response?.data?.message || error.message || 'Không thể chuẩn bị sản phẩm để thanh toán.');
            }
            return;
        }

        navigate('/payment', {
            state: {
                checkoutUserId: getAuthSession().userId,
                selectedItems: [{
                    productId: product._id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.images?.[0] || '',
                    quantity: selectedQuantity
                }],
                totalPrice: Number(product.price) * selectedQuantity
            }
        });
    };

    return (
        <ProductDetailsComponent
            product={product}
            isLoading={loading}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
        />
    );
};

export default ProductDetailsPage;