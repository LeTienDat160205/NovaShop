import React, { useEffect, useState } from 'react';
import {
    SectionCard,
    CardTitle,
    SimilarProductsGrid,
    SimilarProductCard,
    SimilarProductImage,
    SimilarProductInfo,
    SimilarProductName,
    SimilarProductRating,
    SimilarProductPrice
} from '../style';

import * as ProductService
    from '../../../services/ProductService';

const SimilarProductsPlaceholder = ({ productId }) => {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadProducts = async () => {

            if (!productId) return;

            try {

                setLoading(true);

                const response =
                    await ProductService
                        .getSimilarProducts(productId);

                if (response?.status === 'OK') {
                    setProducts(response.data || []);
                }

            } catch (error) {

                console.error(
                    'Lỗi sản phẩm tương tự:',
                    error
                );

                setProducts([]);

            } finally {

                setLoading(false);
            }
        };

        loadProducts();

    }, [productId]);

    const formatPrice = (price) => {
        return `${Number(price || 0)
            .toLocaleString('vi-VN')} ₫`;
    };

    const renderStars = (rating) => {

        const value =
            Math.round(Number(rating || 0));

        return '★'.repeat(value) +
            '☆'.repeat(5 - value);
    };

    return (
        <SectionCard>

            <CardTitle>
                Sản phẩm tương tự
            </CardTitle>

            {loading ? (

                <div
                    style={{
                        padding: 30,
                        textAlign: 'center',
                        color: '#999'
                    }}
                >
                    Đang tìm sản phẩm phù hợp...
                </div>

            ) : products.length === 0 ? (

                <div
                    style={{
                        padding: 30,
                        textAlign: 'center',
                        color: '#999'
                    }}
                >
                    Chưa có sản phẩm tương tự.
                </div>

            ) : (

                <SimilarProductsGrid>

                    {products.map(product => {

                        const image =
                            product.images?.[0] ||
                            product.image?.[0] ||
                            product.image ||
                            'https://via.placeholder.com/300';

                        return (

                            <SimilarProductCard
                                key={product._id}
                                to={`/product-details/${product._id}`}
                            >

                                <SimilarProductImage>
                                    <img
                                        src={image}
                                        alt={product.name}
                                    />
                                </SimilarProductImage>

                                <SimilarProductInfo>

                                    <SimilarProductName>
                                        {product.name}
                                    </SimilarProductName>

                                    <SimilarProductRating>
                                        {renderStars(product.rating)}
                                    </SimilarProductRating>

                                    <SimilarProductPrice>
                                        {formatPrice(
                                            product.price
                                        )}
                                    </SimilarProductPrice>

                                </SimilarProductInfo>

                            </SimilarProductCard>
                        );
                    })}

                </SimilarProductsGrid>
            )}

        </SectionCard>
    );
};

export default SimilarProductsPlaceholder;