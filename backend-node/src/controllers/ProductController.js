const Product = require('../models/ProductModel');
const mongoose = require('mongoose');
const getProductRatingSummaries = require('../utils/getProductRatingSummaries');


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
                    listPrice: 1,
                    list_price: 1,
                    rating: 1,
                    images: 1,
                    brand: 1,
                    createdAt: 1
                }
            }
        ]);
        const ratingSummaries = await getProductRatingSummaries(products);
        const productsWithRatings = products.map(product => ({
            ...product,
            rating: ratingSummaries.get(String(product._id))?.average || 0,
            reviewCount: ratingSummaries.get(String(product._id))?.count || 0
        }));

        return res.status(200).json({
            status: "OK",
            message: "Lấy danh sách sản phẩm thành công",
            data: productsWithRatings
        });
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message
        });
    }
};

const getTopDeals = async (req, res) => {
    try {
        const limit = Math.min(50, Math.max(1, Math.floor(Number(req.query.limit) || 6)));
        const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
        const excludeProductId = req.query.excludeProductId;

        if (excludeProductId && !mongoose.isValidObjectId(excludeProductId)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'ID sản phẩm cần loại trừ không hợp lệ'
            });
        }

        const listPriceExpression = {
            $ifNull: ['$listPrice', { $ifNull: ['$list_price', 0] }]
        };
        const priceExpression = { $ifNull: ['$price', 0] };
        const match = {
            $expr: {
                $and: [
                    { $gt: [priceExpression, 0] },
                    { $gt: [listPriceExpression, priceExpression] }
                ]
            }
        };
        if (excludeProductId) {
            match._id = { $ne: new mongoose.Types.ObjectId(excludeProductId) };
        }

        const [result] = await Product.aggregate([
            { $match: match },
            {
                $facet: {
                    products: [
                        {
                            $addFields: {
                                listPrice: listPriceExpression,
                                discountPercent: {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $subtract: [listPriceExpression, priceExpression] },
                                                listPriceExpression
                                            ]
                                        },
                                        100
                                    ]
                                }
                            }
                        },
                        { $sort: { discountPercent: -1, createdAt: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                name: 1,
                                price: 1,
                                listPrice: 1,
                                discountPercent: 1,
                                rating: 1,
                                images: 1,
                                brand: 1,
                                createdAt: 1
                            }
                        }
                    ],
                    metadata: [{ $count: 'total' }]
                }
            }
        ]);
        const products = result?.products || [];
        const ratingSummaries = await getProductRatingSummaries(products);
        const productsWithRatings = products.map(product => ({
            ...product,
            rating: ratingSummaries.get(String(product._id))?.average || 0,
            reviewCount: ratingSummaries.get(String(product._id))?.count || 0
        }));

        return res.status(200).json({
            status: 'OK',
            message: 'Lấy sản phẩm Top deal thành công',
            data: productsWithRatings,
            total: result?.metadata?.[0]?.total || 0,
            page,
            limit,
            hasMore: page * limit < (result?.metadata?.[0]?.total || 0)
        });
    } catch (error) {
        console.error('Lỗi getTopDeals:', error);
        return res.status(500).json({
            status: 'ERR',
            message: 'Không thể tải sản phẩm Top deal'
        });
    }
};


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

        const ratingSummary = (await getProductRatingSummaries([product]))
            .get(String(product._id));
        const productData = product.toObject();
        productData.rating = ratingSummary.average;
        productData.reviewCount = ratingSummary.count;
        productData.datasetReviewCount = ratingSummary.datasetCount;
        productData.novaShopReviewCount = ratingSummary.novaShopCount;

        return res.status(200).json({
            status: 'OK',
            data: productData
        });
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};


const proxyRecommendations = async (req, res, userId = null) => {
    try {
        const query = new URLSearchParams({
            limit: String(req.query.limit || 12),
            page: String(req.query.page || 1)
        });
        if (userId) query.set('userId', userId);
        if (req.query.excludeProductId) {
            query.set('excludeProductId', String(req.query.excludeProductId));
        }
        if (req.query.excludeProductIds) {
            query.set('excludeProductIds', String(req.query.excludeProductIds));
        }

        const engineUrl = (process.env.REC_ENGINE_URL || 'http://localhost:8001')
            .replace(/\/+$/, '');
        const engineResponse = await fetch(
            `${engineUrl}/recommendations/default?${query.toString()}`,
            { signal: AbortSignal.timeout(8000) }
        );
        const payload = await engineResponse.json();

        return res.status(engineResponse.status).json(payload);
    } catch (error) {
        console.error('Lỗi getRecommendations:', error);
        return res.status(503).json({
            status: 'ERR',
            message: 'Recommendation engine hiện không khả dụng.'
        });
    }
};

const getRecommendations = (req, res) =>
    proxyRecommendations(req, res, req.user?.id || null);

const getDefaultRecommendations = (req, res) =>
    proxyRecommendations(req, res);

const getSimilarProducts = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'ID sản phẩm không hợp lệ'
            });
        }

        const engineUrl = (process.env.REC_ENGINE_URL || 'http://localhost:8001')
            .replace(/\/+$/, '');
        const query = new URLSearchParams({ productId, limit: '8' });
        const engineResponse = await fetch(
            `${engineUrl}/recommendations/similar?${query.toString()}`,
            { signal: AbortSignal.timeout(8000) }
        );
        const payload = await engineResponse.json();

        return res.status(engineResponse.status).json(payload);
    } catch (e) {
        console.error('Lỗi getSimilarProducts:', e);
        return res.status(503).json({
            status: 'ERR',
            message: 'Recommendation engine hiện không khả dụng.'
        });
    }
};


const getProductsByCategory = async (req, res) => {
  try {
    const { category, search } = req.query;

    const andConditions = [];


    if (category && category !== "all") {
      const keywords = category.split('|').map(k => k.trim()).filter(Boolean);
      const orCategoryConditions = [];
      keywords.forEach(kw => {
        const regex = new RegExp(kw, "i");
        orCategoryConditions.push({ group: { $regex: regex } });
        orCategoryConditions.push({ name: { $regex: regex } });
        orCategoryConditions.push({ categoryPath: { $regex: regex } });
      });
      if (orCategoryConditions.length > 0) {
        andConditions.push({ $or: orCategoryConditions });
      }
    }


    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      andConditions.push({
        $or: [
          { name: { $regex: searchRegex } },
          { brand: { $regex: searchRegex } },
          { group: { $regex: searchRegex } },
          { categoryPath: { $regex: searchRegex } }
        ]
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const products = await Product.find(query).lean();
    const ratingSummaries = await getProductRatingSummaries(products);
    const productsWithRatings = products.map(product => {
      const summary = ratingSummaries.get(String(product._id));
      return {
        ...product,
        rating: summary?.average || 0,
        reviewCount: summary?.count || 0
      };
    });

    return res.status(200).json({
      status: "OK",
      message: "Lấy sản phẩm thành công",
      total: productsWithRatings.length,
      data: productsWithRatings,
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
    getTopDeals,
    getDetailsProduct,
    getRecommendations,
    getDefaultRecommendations,
    getSimilarProducts,
    getProductsByCategory
};