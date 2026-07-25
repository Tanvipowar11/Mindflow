import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },

  userId: {
    type: String,
    required: true,
  },

  title: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

conversationSchema.set('toJSON', { virtuals: true });
conversationSchema.set('toObject', { virtuals: true });

export const Conversation = mongoose.model(
  'Conversation',
  conversationSchema
);