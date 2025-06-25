const goalModel = require('../models/goalModel');
const { createGoal } = require('../services/goalService');
const mongoose = require('mongoose');

const getGoals = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const goals = await goalModel.find({ userId: req.user._id });
        return res.status(200).json({
            goals,
            success: true
        });
    } catch (err) {
        console.log('err', err);
        return res.status(402).json({ msg: "no user found" });
    }
};

const addGoal = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Unauthorised' });
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'No goal payload found' });
        }
        const payload = { ...req.body.goal, userId: req.user._id };
        const newGoal = await createGoal(payload);
        const goals = await goalModel.find({ userId: req.user._id });
        return res.status(201).json({
            success: true,
            goal: newGoal,
            goals
        });
    } catch (err) {
        console.error('addGoal error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { goal } = req.body;

    
        
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Unauthorised' });
        }
        if (!goal || typeof goal !== 'object') {
            return res.status(400).json({ success: false, message: 'Goal data is required in request body' });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid goal ID format' });
        }
        const updateFields = {};
        if (goal.name !== undefined) updateFields.name = goal.name;
        if (goal.targetAmount !== undefined) updateFields.targetAmount = goal.targetAmount;
        if (goal.savedAmount !== undefined) updateFields.savedAmount = goal.savedAmount;
        if (goal.deadline !== undefined) updateFields.deadline = goal.deadline;
        updateFields.updatedAt = new Date();
        const updatedGoal = await goalModel.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { $set: updateFields },
            { new: true, runValidators: true }
        );
        if (!updatedGoal) {
            return res.status(404).json({ success: false, message: 'Goal not found or access denied' });
        }
        const allGoals = await goalModel.find({ userId: req.user._id }).sort({ deadline: 1, createdAt: -1 }).lean();
        return res.status(200).json({
            success: true,
            updatedGoal,
            goals: allGoals,
            message: 'Goal updated successfully'
        });
    } catch (error) {
        console.error('Update goal error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update goal',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const deleted = await goalModel.findOneAndDelete({
            _id: id,
            userId
        });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Goal not found or not authorised' });
        }
        const goals = await goalModel.find({ userId });
        return res.status(200).json({
            success: true,
            message: 'Goal deleted',
            goal: deleted,
            goals
        });
    } catch (err) {
        console.error('deleteGoal error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getGoals, addGoal, updateGoal, deleteGoal };