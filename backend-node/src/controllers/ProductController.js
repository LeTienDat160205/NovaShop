const Product = require('../models/ProductModel');

// 1. API Lấy tất cả sản phẩm
const getAllProduct = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            50,
            Math.max(1, Number(req.query.limit) || 18)
        );

        const products = await Product.aggregate([
            { $sample: { size: page * limit } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    price: 1,
                    rating: 1,
                    images: 1,
                    brand: 1
                }
            }
        ]);

        return res.status(200).json({
            status: "OK",
            message: "Lấy danh sách sản phẩm thành công",
            data: products
        });
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
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

        const currentProduct = await Product.findById(productId)
            .select('name categoryPath specifications brand price')
            .lean();

        if (!currentProduct) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const normalize = (value) => {
            if (value === null || value === undefined) return '';

            return String(value)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };

        const getNameWords = (name) => {
            const stopWords = new Set([
                'va', 'cho', 'cua', 'loai', 'cao', 'cap',
                'chinh', 'hang', 'new', 'moi', 'combo'
            ]);

            return new Set(
                normalize(name)
                    .split(' ')
                    .filter(word => word.length >= 3 && !stopWords.has(word))
            );
        };

        // Ưu tiên sản phẩm cùng danh mục cấp cuối
        const categories = currentProduct.categoryPath || [];
        const leafCategory = categories.length
            ? categories[categories.length - 1]
            : null;

        let candidateFilter;

        if (leafCategory) {
            candidateFilter = {
                categoryPath: leafCategory
            };
        } else if (currentProduct.brand) {
            candidateFilter = {
                brand: currentProduct.brand
            };
        } else {
            // Trường hợp dữ liệu thiếu danh mục và thương hiệu
            candidateFilter = {};
        }

        candidateFilter._id = { $ne: currentProduct._id };

        // Chỉ lấy dữ liệu cần thiết, tối đa 300 ứng viên
        const products = await Product.find(candidateFilter)
            .select('name categoryPath specifications brand price rating images')
            .limit(300)
            .lean();

        const currentCategories = new Set(
            categories.map(normalize).filter(Boolean)
        );

        const currentSpecs = currentProduct.specifications || {};
        const currentSpecEntries = Object.entries(currentSpecs).map(
            ([key, value]) => [normalize(key), normalize(value)]
        );

        const currentNameWords = getNameWords(currentProduct.name || '');
        const currentPrice = Number(currentProduct.price || 0);
        const currentBrand = normalize(currentProduct.brand);

        const scoredProducts = products.map(product => {
            // 1. CATEGORY - tối đa 30 điểm
            const productCategories = new Set(
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

            const categoryScore = currentCategories.size
                ? (commonCategories / currentCategories.size) * 30
                : 0;

            // 2. SPECIFICATIONS - tối đa 35 điểm
            const productSpecs = new Map(
                Object.entries(product.specifications || {}).map(
                    ([key, value]) => [normalize(key), normalize(value)]
                )
            );

            let matchedSpecs = 0;

            currentSpecEntries.forEach(([key, value]) => {
                if (!productSpecs.has(key)) return;

                const productValue = productSpecs.get(key);

                if (value === productValue) {
                    matchedSpecs += 1;
                } else {
                    const productWords = new Set(productValue.split(' '));

                    if (value.split(' ').some(
                        word => word.length >= 2 && productWords.has(word)
                    )) {
                        matchedSpecs += 0.5;
                    }
                }
            });

            const specScore = currentSpecEntries.length
                ? (matchedSpecs / currentSpecEntries.length) * 35
                : 0;

            // 3. TÊN SẢN PHẨM - tối đa 15 điểm
            const productNameWords = getNameWords(product.name || '');
            let commonNameWords = 0;

            currentNameWords.forEach(word => {
                if (productNameWords.has(word)) commonNameWords++;
            });

            const nameScore = currentNameWords.size
                ? (commonNameWords / currentNameWords.size) * 15
                : 0;

            // 4. BRAND - tối đa 10 điểm
            const brandScore =
                currentBrand &&
                product.brand &&
                currentBrand === normalize(product.brand)
                    ? 10
                    : 0;

            // 5. PRICE - tối đa 10 điểm
            let priceScore = 0;
            const productPrice = Number(product.price || 0);

            if (currentPrice > 0 && productPrice > 0) {
                const differencePercent =
                    Math.abs(currentPrice - productPrice) /
                    ((currentPrice + productPrice) / 2);

                if (differencePercent <= 0.1) priceScore = 10;
                else if (differencePercent <= 0.2) priceScore = 8;
                else if (differencePercent <= 0.3) priceScore = 6;
                else if (differencePercent <= 0.5) priceScore = 3;
            }

            const totalScore =
                categoryScore + specScore + nameScore +
                brandScore + priceScore;

            return {
                ...product,
                similarityScore: Number(totalScore.toFixed(2))
            };
        });

        scoredProducts.sort((a, b) => {
            if (b.similarityScore !== a.similarityScore) {
                return b.similarityScore - a.similarityScore;
            }

            return Number(b.rating || 0) - Number(a.rating || 0);
        });

        return res.status(200).json({
            status: 'OK',
            message: 'Lấy sản phẩm tương tự thành công',
            data: scoredProducts.slice(0, 8)
        });
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

// 4. API Lấy danh sách sản phẩm theo thể loại (Category)
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu tham số category",
      });
    }

    // Tách các từ khóa nếu có dấu gạch đứng (|), ví dụ: "Chuột|Bàn Phím"
    const keywords = category.split('|').map(k => k.trim()).filter(Boolean);
    
    // Tạo mảng điều kiện OR cho từng từ khóa
    const orConditions = [];
    keywords.forEach(kw => {
      const regex = new RegExp(kw, "i");
      orConditions.push({ group: { $regex: regex } });
      orConditions.push({ name: { $regex: regex } });
      orConditions.push({ categoryPath: { $regex: regex } });
    });

    console.log("--> Đang tìm kiếm category với từ khóa:", keywords);

    const products = await Product.find({ $or: orConditions }).lean();

    console.log(`--> Tìm thấy ${products.length} sản phẩm`);

    return res.status(200).json({
      status: "OK",
      message: "Lấy sản phẩm thành công",
      total: products.length,
      data: products,
    });
  } catch (e) {
    console.error("Lỗi getProductsByCategory:", e);
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

module.exports = {
    getAllProduct,
    getDetailsProduct,
    getSimilarProducts,
    getProductsByCategory
};