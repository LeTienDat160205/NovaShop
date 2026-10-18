const Product = require('../models/ProductModel');

const refreshCartPrices = async (cart) => {
    if (!cart.items.length) {
        cart.total = 0;
        return;
    }

    const productIds = cart.items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(
        products.map(product => [product._id.toString(), product])
    );

    cart.items = cart.items.filter(item =>
        productMap.has(item.productId.toString())
    );

    cart.items.forEach(item => {
        const product = productMap.get(item.productId.toString());
        item.unitPrice = Number(product.price || 0);
        item.totalPrice = item.unitPrice * Number(item.quantity || 1);
    });

    cart.total = cart.items.reduce(
        (sum, item) => sum + Number(item.totalPrice || 0), 0
    );
};

const formatCart = (cart) => {
    const items = (cart?.items || [])
        .filter(item => item.productId)
        .map(item => {
            const product = item.productId;
            const quantity = Number(item.quantity || 1);
            const unitPrice = Number(item.unitPrice || 0);

            return {
                productId: product._id.toString(),
                name: product.name,
                price: unitPrice,
                unitPrice,
                listPrice: Number(product.listPrice || unitPrice),
                image: product.images?.[0] || '',
                images: product.images || [],
                quantity,
                totalPrice: unitPrice * quantity,
                addedAt: item.addedAt
            };
        });

    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
    return { items, total };
};

module.exports = { refreshCartPrices, formatCart };
