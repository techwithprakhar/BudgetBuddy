
const GoalModel = require('../models/goalModel');

module.exports.createGoal = async ({ userId, name, targetAmount, savedAmount = 0, deadline }) => {

    if (!userId || !name || !targetAmount || !deadline) {
        throw new Error("All fields are required");
    }
    if (typeof targetAmount !== 'number' || targetAmount <= 0) {
        throw new Error("Target amount must be a positive number");
    }
    if (typeof savedAmount !== 'number' || savedAmount < 0) {
        throw new Error("Saved amount must be a non-negative number");
    }
    const goal = await GoalModel.create({
        userId,
        name,
        targetAmount,
        savedAmount,
        deadline
    });
    return goal;
};