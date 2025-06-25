

const { Schema, model } = require('mongoose');

// GoalSchema — represents one savings / investment goal
const GoalSchema = new Schema(
  {
    // Which user owns this goal
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",  // documents in the `user` collection
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    savedAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
 
    deadline: {
      type: Date,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // adds createdAt & updatedAt automatically
    timestamps: true,
  }
);

// Model: GoalModel
// Collection name forced to: goals
const GoalModel = model("GoalModel", GoalSchema, "goals");

module.exports= GoalModel;
