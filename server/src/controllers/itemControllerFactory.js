import TrashItem from '../models/TrashItem.js';
import ArchiveItem from '../models/ArchiveItem.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Builds a standard set of CRUD controllers for a "list" resource
 * (todos, notes, reminders) that all follow the same shape:
 * every item belongs to a user, can be created/updated, and when
 * removed goes to trash (or archive) instead of being deleted outright.
 *
 * @param {import('mongoose').Model} Model - the Mongoose model (Todo, Note, Reminder)
 * @param {'todo'|'note'|'reminder'} type - the type label used in trash/archive records
 */
export default function buildItemController(Model, type) {
  // GET /api/<items>  — list everything that belongs to the logged-in user
  const list = asyncHandler(async (req, res) => {
    const items = await Model.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  });

  // POST /api/<items>  — create a new item owned by the logged-in user
  const create = asyncHandler(async (req, res) => {
    const item = await Model.create({ ...req.body, user: req.user.id });
    res.status(201).json(item);
  });

  // PUT /api/<items>/:id  — update an item, but only if it belongs to this user
  const update = asyncHandler(async (req, res) => {
    const item = await Model.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json(item);
  });

  // DELETE /api/<items>/:id  — move the item to the trash collection
  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    const trashEntry = await TrashItem.create({
      user: req.user.id,
      type,
      originalId: item._id,
      payload: item.toObject(),
    });
    res.json(trashEntry);
  });

  // PATCH /api/<items>/:id/archive  — move the item straight to the archive collection
  const archive = asyncHandler(async (req, res) => {
    const item = await Model.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    const archiveEntry = await ArchiveItem.create({
      user: req.user.id,
      type,
      originalId: item._id,
      payload: item.toObject(),
    });
    res.json(archiveEntry);
  });

  return { list, create, update, remove, archive };
}
