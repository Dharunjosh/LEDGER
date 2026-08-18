import ArchiveItem from '../models/ArchiveItem.js';
import TrashItem from '../models/TrashItem.js';
import Todo from '../models/Todo.js';
import Note from '../models/Note.js';
import Reminder from '../models/Reminder.js';
import asyncHandler from '../utils/asyncHandler.js';

const MODEL_BY_TYPE = { todo: Todo, note: Note, reminder: Reminder };

function cleanPayload(payload) {
  const { _id, __v, createdAt, updatedAt, ...rest } = payload;
  return rest;
}

// GET /api/archive
export const list = asyncHandler(async (req, res) => {
  const items = await ArchiveItem.find({ user: req.user.id }).sort({ archivedAt: -1 });
  res.json(items);
});

// POST /api/archive/:id/restore
export const restore = asyncHandler(async (req, res) => {
  const entry = await ArchiveItem.findOne({ _id: req.params.id, user: req.user.id });
  if (!entry) return res.status(404).json({ message: 'Archive entry not found.' });

  const Model = MODEL_BY_TYPE[entry.type];
  const restored = await Model.create({ ...cleanPayload(entry.payload), user: req.user.id });
  await entry.deleteOne();

  res.json(restored);
});

// POST /api/archive/:id/trash  — move an archived item back to the recycle bin
export const moveToTrash = asyncHandler(async (req, res) => {
  const entry = await ArchiveItem.findOne({ _id: req.params.id, user: req.user.id });
  if (!entry) return res.status(404).json({ message: 'Archive entry not found.' });

  const trashed = await TrashItem.create({
    user: req.user.id,
    type: entry.type,
    originalId: entry.originalId,
    payload: entry.payload,
  });
  await entry.deleteOne();

  res.json(trashed);
});
