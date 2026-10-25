const Interaction = require('../models/InteractionModel');

const recordInteraction = async (userId, productId, type) => {
    try {
        await Interaction.create({ userId, productId, type });
    } catch (error) {
        console.error('Record product interaction error:', error);
    }
};

module.exports = recordInteraction;
