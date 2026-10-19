const DatasetRating = require('../models/DatasetRatingModel');
const Review = require('../models/ReviewModel');
const calculateCombinedRating = require('./calculateCombinedRating');

const createEmptyRatingCounts = () => ({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
});

const addRatings = (counts, ratings = []) => {
    for (const rating of ratings) {
        if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
            counts[rating] += 1;
        }
    }
};

const getProductRatingSummaries = async products => {
    const productList = products.filter(product => product?._id);
    if (!productList.length) return new Map();

    const productIds = productList.map(product => product._id);
    const [datasetSummaries, novaShopSummaries] = await Promise.all([
        DatasetRating.aggregate([
            { $match: { productId: { $in: productIds }, source: 'ReviewClean' } },
            {
                $group: {
                    _id: '$productId',
                    count: { $sum: 1 },
                    ratingSum: { $sum: '$rating' },
                    ratings: { $push: '$rating' }
                }
            }
        ]),
        Review.aggregate([
            { $match: { productId: { $in: productIds } } },
            {
                $group: {
                    _id: '$productId',
                    count: { $sum: 1 },
                    ratingSum: { $sum: '$rating' },
                    ratings: { $push: '$rating' }
                }
            }
        ])
    ]);

    const datasetByProductId = new Map(
        datasetSummaries.map(summary => [String(summary._id), summary])
    );
    const novaShopByProductId = new Map(
        novaShopSummaries.map(summary => [String(summary._id), summary])
    );

    return new Map(productList.map(product => {
        const productId = String(product._id);
        const dataset = datasetByProductId.get(productId);
        const novaShop = novaShopByProductId.get(productId);
        const datasetCount = dataset?.count || 0;
        const novaShopCount = novaShop?.count || 0;
        const count = datasetCount + novaShopCount;
        const ratingSum = (dataset?.ratingSum || 0) + (novaShop?.ratingSum || 0);
        const ratingCounts = createEmptyRatingCounts();

        addRatings(ratingCounts, dataset?.ratings);
        addRatings(ratingCounts, novaShop?.ratings);

        return [productId, {
            count,
            datasetCount,
            novaShopCount,
            average: datasetCount > 0
                ? calculateCombinedRating(0, count, ratingSum)
                : calculateCombinedRating(
                    product.rating,
                    novaShopCount,
                    novaShop?.ratingSum || 0
                ),
            ratingCounts
        }];
    }));
};

module.exports = getProductRatingSummaries;
