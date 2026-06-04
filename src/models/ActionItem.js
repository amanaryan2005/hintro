import mongoose from 'mongoose';

const actionItemSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  task: { type: String, required: true },
  assignee: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'IN PROGRESS', 'COMPLETED'], default: 'PENDING' },
  dueDate: { type: Date, required: true },
  citations: [{ timestamp: { type: String } }],
  remindersSent: [{ sentAt: { type: Date, default: Date.now } }]
}, { timestamps: true });

export const ActionItem = mongoose.model('ActionItem', actionItemSchema);