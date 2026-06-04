import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  speaker: { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const citationSchema = new mongoose.Schema({
  timestamp: { type: String, required: true }
}, { _id: false });

const analyzedItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  citations: [citationSchema]
}, { _id: false });

const meetingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  participants: [{ type: String }],
  meetingDate: { type: Date, required: true },
  transcript: [transcriptSchema],
  analysis: {
    summary: [analyzedItemSchema],
    decisions: [analyzedItemSchema],
    followUpSuggestions: [analyzedItemSchema]
  }
}, { timestamps: true });

export const Meeting = mongoose.model('Meeting', meetingSchema);