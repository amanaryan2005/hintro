import { ActionItem } from '../models/ActionItem.js';

export const createActionItem = async (req, res, next) => {
  try {
    const { meetingId, task, assignee, dueDate, citations } = req.body;
    if (!meetingId || !task || !assignee || !dueDate) {
       return res.status(400).json({
         traceId: req.traceId,
         success: false,
         error: { code: "VALIDATION_ERROR", message: "meetingId, task, assignee, and dueDate are required." }
       });
    }

    const newItem = await ActionItem.create({ meetingId, task, assignee, dueDate, citations: citations || [] });
    res.status(201).json({ traceId: req.traceId, success: true, data: newItem });
  } catch (error) { next(error); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'IN PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({
        traceId: req.traceId,
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid status value." }
      });
    }

    const updatedItem = await ActionItem.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        traceId: req.traceId,
        success: false,
        error: { code: "NOT_FOUND", message: "Action item not found." }
      });
    }

    res.json({ traceId: req.traceId, success: true, data: updatedItem });
  } catch (error) { next(error); }
};

export const getActionItems = async (req, res, next) => {
  try {
    const { status, assignee, meetingId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (meetingId) filter.meetingId = meetingId;

    const items = await ActionItem.find(filter);
    res.json({ traceId: req.traceId, success: true, data: items });
  } catch (error) { next(error); }
};

export const getOverdueActionItems = async (req, res, next) => {
  try {
    const overdue = await ActionItem.find({
      status: { $ne: 'COMPLETED' },
      dueDate: { $lt: new Date() }
    });
    res.json({ traceId: req.traceId, success: true, data: overdue });
  } catch (error) { next(error); }
};