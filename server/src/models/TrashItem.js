import mongoose from 'mongoose';

// A trashed item keeps a snapshot of the original document (`payload`) plus
// enough metadata to restore it later into the right collection.
const trashItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['todo', 'note', 'reminder'], required: true },
    originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('TrashItem', trashItemSchema);
