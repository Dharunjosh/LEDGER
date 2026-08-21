import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    dueDate: { type: String, default: null },
    completed: { type: Boolean, default: false },
    highlighted: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    subtasks: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Todo', todoSchema);
