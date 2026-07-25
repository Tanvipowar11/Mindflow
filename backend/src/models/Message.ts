import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },

  conversationId: {
    type: String,
    required: true,
  },

  userId: {
    type: String,
    required: true,
  },

  content: String,

  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
},  
  {
    timestamps: true,
  }
);

messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

export const Message = mongoose.model(
  'Message',
  messageSchema
);