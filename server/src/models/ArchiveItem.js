import mongoose from 'mongoose';

const archiveItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['todo', 'note', 'reminder'], required: true },
    originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    archivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('ArchiveItem', archiveItemSchema);
