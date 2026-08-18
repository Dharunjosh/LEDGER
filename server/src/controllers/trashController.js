import TrashItem from '../models/TrashItem.js';
import ArchiveItem from '../models/ArchiveItem.js';
import Todo from '../models/Todo.js';
import Note from '../models/Note.js';
import Reminder from '../models/Reminder.js';
import asyncHandler from '../utils/asyncHandler.js';

// Maps the "type" label stored on trash/archive entries back to the real model,
// so a restore knows which collection to re-insert the item into.
const MODEL_BY_TYPE = { todo: Todo, note: Note, reminder: Reminder };

function cleanPayload(payload) {
  // Drop the old Mongo _id and timestamps so re-inserting creates a fresh document.
  const { _id, __v, createdAt, updatedAt, ...rest } = payload;
  return rest;
}

// GET /api/trash
export const list = asyncHandler(async (req, res) => {
  const items = await TrashItem.find({ user: req.user.id }).sort({ deletedAt: -1 });
  res.json(items);
});

// POST /api/trash/:id/restore
export const restore = asyncHandler(async (req, res) => {
  const entry = await TrashItem.findOne({ _id: req.params.id, user: req.user.id });
  if (!entry) return res.status(404).json({ message: 'Trash entry not found.' });

  const Model = MODEL_BY_TYPE[entry.type];
  const restored = await Model.create({ ...cleanPayload(entry.payload), user: req.user.id });
  await entry.deleteOne();

  res.json(restored);
});

// POST /api/trash/:id/archive  — move a trashed item into the archive instead
export const moveToArchive = asyncHandler(async (req, res) => {
  const entry = await TrashItem.findOne({ _id: req.params.id, user: req.user.id });
  if (!entry) return res.status(404).json({ message: 'Trash entry not found.' });

  const archived = await ArchiveItem.create({
    user: req.user.id,
    type: entry.type,
    originalId: entry.originalId,
    payload: entry.payload,
  });
  await entry.deleteOne();

  res.json(archived);
});

// DELETE /api/trash/:id  — permanently remove a single trashed item
export const remove = asyncHandler(async (req, res) => {
  const entry = await TrashItem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!entry) return res.status(404).json({ message: 'Trash entry not found.' });
  res.json({ message: 'Permanently deleted.' });
});

// DELETE /api/trash  — empty the whole bin
export const empty = asyncHandler(async (req, res) => {
  await TrashItem.deleteMany({ user: req.user.id });
  res.json({ message: 'Recycle bin emptied.' });
});
