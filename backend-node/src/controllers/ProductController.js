const Product = require('../models/ProductModel');

// 1. API Lấy tất cả sản phẩm
const getAllProduct = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({
            status: 'OK',
            message: 'Lấy danh sách sản phẩm thành công',
            data: products
        });
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

// 2. API Lấy chi tiết 1 sản phẩm theo ID
const getDetailsProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Không tìm thấy sản phẩm'
            });
        }
        return res.status(200).json({
            status: 'OK',
            data: product
        });
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

// 3. API lấy sản phẩm tương tự
const getSimilarProducts = async (req, res) => {
    try {
        const productId = req.params.id;

        const currentProduct =
            await Product.findById(productId).lean();

        if (!currentProduct) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const products = await Product.find({
            _id: { $ne: currentProduct._id }
        }).lean();

        const normalize = (value) => {
            if (value === null || value === undefined) {
                return '';
            }

            return String(value)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };

        // Tách từ trong tên sản phẩm
        const getNameWords = (name) => {
            const stopWords = new Set([
                'va',
                'cho',
                'cua',
                'loai',
                'cao',
                'cap',
                'chinh',
                'hang',
                'new',
                'moi',
                'combo'
            ]);

            return new Set(
                normalize(name)
                    .split(' ')
                    .filter(
                        word =>
                            word.length >= 3 &&
                            !stopWords.has(word)
                    )
            );
        };

        // Category hiện tại
        const currentCategories =
            new Set(
                (currentProduct.categoryPath || [])
                    .map(normalize)
                    .filter(Boolean)
            );

        // Specifications hiện tại
        const currentSpecs =
            currentProduct.specifications || {};

        const currentNameWords =
            getNameWords(currentProduct.name || '');

        const scoredProducts = products.map(product => {

            // 1. CATEGORY - tối đa 30 điểm
            const productCategories =
                new Set(
                    (product.categoryPath || [])
                        .map(normalize)
                        .filter(Boolean)
                );

            let commonCategories = 0;

            currentCategories.forEach(category => {
                if (productCategories.has(category)) {
                    commonCategories++;
                }
            });

            let categoryScore = 0;

            if (currentCategories.size > 0) {
                categoryScore =
                    (commonCategories /
                        currentCategories.size) * 30;
            }

            // 2. SPECIFICATIONS - tối đa 35 điểm
            const productSpecs =
                product.specifications || {};

            const currentSpecKeys =
                Object.keys(currentSpecs);

            let matchedSpecs = 0;

            currentSpecKeys.forEach(key => {

                const currentKey = normalize(key);

                const productKey =
                    Object.keys(productSpecs)
                        .find(
                            k => normalize(k) === currentKey
                        );

                if (!productKey) return;

                const currentValue =
                    normalize(currentSpecs[key]);

                const productValue =
                    normalize(productSpecs[productKey]);

                // Giống hoàn toàn
                if (currentValue === productValue) {
                    matchedSpecs += 1;
                    return;
                }

                // Có từ khóa chung
                const currentWords =
                    currentValue.split(' ');

                const productWords =
                    productValue.split(' ');

                const commonWords =
                    currentWords.filter(
                        word =>
                            word.length >= 2 &&
                            productWords.includes(word)
                    );

                if (commonWords.length > 0) {
                    matchedSpecs += 0.5;
                }
            });

            let specScore = 0;

            if (currentSpecKeys.length > 0) {
                specScore =
                    (matchedSpecs /
                        currentSpecKeys.length) * 35;
            }

            // 3. TÊN SẢN PHẨM - tối đa 15 điểm
            const productNameWords =
                getNameWords(product.name || '');

            let commonNameWords = 0;

            currentNameWords.forEach(word => {
                if (productNameWords.has(word)) {
                    commonNameWords++;
                }
            });

            let nameScore = 0;

            if (currentNameWords.size > 0) {
                nameScore =
                    (commonNameWords /
                        currentNameWords.size) * 15;
            }

            // 4. BRAND - tối đa 10 điểm
            let brandScore = 0;

            if (
                currentProduct.brand &&
                product.brand &&
                normalize(currentProduct.brand) ===
                    normalize(product.brand)
            ) {
                brandScore = 10;
            }

            // 5. PRICE - tối đa 10 điểm
            let priceScore = 0;

            const currentPrice =
                Number(currentProduct.price || 0);

            const productPrice =
                Number(product.price || 0);

            if (
                currentPrice > 0 &&
                productPrice > 0
            ) {
                const difference =
                    Math.abs(
                        currentPrice -
                        productPrice
                    );

                const average =
                    (currentPrice +
                        productPrice) / 2;

                const differencePercent =
                    difference / average;

                if (differencePercent <= 0.1) {
                    priceScore = 10;
                } else if (differencePercent <= 0.2) {
                    priceScore = 8;
                } else if (differencePercent <= 0.3) {
                    priceScore = 6;
                } else if (differencePercent <= 0.5) {
                    priceScore = 3;
                }
            }

            const totalScore =
                categoryScore +
                specScore +
                nameScore +
                brandScore +
                priceScore;

            return {
                ...product,
                similarityScore:
                    Number(totalScore.toFixed(2))
            };
        });

        // SẮP XẾP
        scoredProducts.sort((a, b) => {

            if (
                b.similarityScore !==
                a.similarityScore
            ) {
                return (
                    b.similarityScore -
                    a.similarityScore
                );
            }

            // Nếu điểm giống nhau
            // ưu tiên rating cao
            return (
                Number(b.rating || 0) -
                Number(a.rating || 0)
            );
        });

        // Lấy 8 sản phẩm
        const result =
            scoredProducts.slice(0, 8);

        return res.status(200).json({
            status: 'OK',
            message:
                'Lấy sản phẩm tương tự thành công',
            data: result
        });

    } catch (e) {

        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

module.exports = {
    getAllProduct,
    getDetailsProduct,
    getSimilarProducts
};