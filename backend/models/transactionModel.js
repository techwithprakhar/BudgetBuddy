const mongoose =require( "mongoose");

const { Schema, model } = mongoose;

const TransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",   // points to documents in the `user` collection
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Adds createdAt & updatedAt automatically
    timestamps: true,
  }
);

// Model: TransactionModel
// Collection: transactions
const TransactionModel = model("TransactionModel", TransactionSchema, "transactions");

module.exports = TransactionModel;
