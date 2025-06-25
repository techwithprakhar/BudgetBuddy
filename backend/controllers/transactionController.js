const transactionModel = require('../models/transactionModel');
const { createTransaction } = require('../services/transactionService')
const mongoose = require('mongoose')

const getTransaction = async (req, res, next) => {
    try {

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const transactions = await transactionModel.find({ userId: req.user._id });
        return res.status(200).json({
            transactions,
            success: true
        });
    } catch (err) {
        console.log('err', err);
        return res.status(402).json({ msg: "no user found" });
    }
};

const addTransaction = async (req, res) => {
    try {

        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Unauthorised' });
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'No transaction payload found' });
        }
        const payload = { ...req.body.transaction, userId: req.user._id };

       
        const newTx = await createTransaction(payload);


        const transactions = await transactionModel.find({ userId: req.user._id });

        return res.status(201).json({
            success: true,
            transaction: newTx,  // the one just created
            transactions         // the updated list
        });
    } catch (err) {
        console.error('addTransaction error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};



// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params; // Transaction ID from URL params
        const { transaction } = req.body; // Extract transaction object from request body

        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Unauthorised' });
        }
        if (!transaction || typeof transaction !== 'object') {
            return res.status(400).json({ success: false, message: 'Transaction data is required in request body' });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid transaction ID format' });
        }

        // Only allow updating fields that exist in the schema
        const updateFields = {};
        if (transaction.title !== undefined) updateFields.title = transaction.title;
        if (transaction.amount !== undefined) updateFields.amount = transaction.amount;
        if (transaction.type !== undefined) updateFields.type = transaction.type;
        if (transaction.category !== undefined) updateFields.category = transaction.category;
        if (transaction.date !== undefined) updateFields.date = transaction.date;
        if (transaction.tags !== undefined) updateFields.tags = transaction.tags;
        if (transaction.notes !== undefined) updateFields.notes = transaction.notes;
        updateFields.updatedAt = new Date();

        // Find and update the transaction for the logged-in user
        const updatedTransaction = await transactionModel.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found or access denied' });
        }

        // Get all user transactions (sorted by date, newest first)
        const allTransactions = await transactionModel.find({ userId: req.user._id })
            .sort({ date: -1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            updatedTransaction,
            transactions: allTransactions,
            message: 'Transaction updated successfully'
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update transaction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const deleteTransaction = async (req, res) => {


    try {

        const {id}=req.params;
        const userId=req.user._id;
        const deleted = await transactionModel.findOneAndDelete({
            _id: id,
            userId
        });

        if (!deleted) {
            return res
                .status(404)
                .json({ success: false, message: 'Transaction not found or not authorised' });
        }

        // 4) (Optional) Fetch remaining transactions for the user
        const transactions = await transactionModel.find({ userId });

        // 5) Return
        return res.status(200).json({
            success: true,
            message: 'Transaction deleted',
            transaction: deleted,
            transactions
        });
    } catch (err) {
        console.error('deleteTransaction error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }

}







module.exports = { getTransaction, addTransaction, updateTransaction, deleteTransaction };