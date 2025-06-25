const TransactionModel = require('../models/transactionModel');

module.exports.createTransaction = async ({ userId, title, amount, date, type, tags = [], notes = "" }) => {

    if (!userId || !title || !amount || !date || !type) {
        throw new Error("All fields are required");
    }
    if (typeof amount !== 'number' || amount <= 0) {
        throw new Error("Amount must be a positive number");
    }
    // Ensure tags is always an array
    if (!Array.isArray(tags)) {
        tags = []; 
    }
    // Ensure date is a Date object
    const dateObj = (date instanceof Date) ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format");
    }
    const transaction = await TransactionModel.create({
        userId,
        title,
        amount,
        date: dateObj,
        type,
        tags,
        notes
    });
    return transaction;
};