const calculateCombinedRating = (storedRating, reviewCount, reviewRatingSum) => {
    const rating = Number(storedRating) || 0;
    const count = Number(reviewCount) || 0;
    const ratingSum = Number(reviewRatingSum) || 0;
    // The products collection stores an average but no vote count, so treat it as one legacy score.
    const hasStoredRating = rating > 0;
    const totalCount = count + (hasStoredRating ? 1 : 0);

    if (!totalCount) return 0;

    return Number(
        ((ratingSum + (hasStoredRating ? rating : 0)) / totalCount).toFixed(1)
    );
};

module.exports = calculateCombinedRating;
