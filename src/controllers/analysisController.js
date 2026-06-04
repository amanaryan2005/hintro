import { Meeting } from '../models/Meeting.js';
import { ActionItem } from '../models/ActionItem.js';
import { analyzeTranscriptWithGemini } from '../services/aiService.js';

export const analyzeMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
    if (!meeting) {
      return res.status(404).json({
        traceId: req.traceId,
        success: false,
        error: { code: "NOT_FOUND", message: "Meeting document missing." }
      });
    }

    if (!meeting.transcript || meeting.transcript.length === 0) {
      return res.status(400).json({
        traceId: req.traceId,
        success: false,
        error: { code: "BAD_REQUEST", message: "Cannot analyze a meeting with an empty transcript." }
      });
    }

    // Process using Gemini Engine
    const aiOutput = await analyzeTranscriptWithGemini(meeting.transcript);

    // Save Structured Analytical Fields to Meeting Model
    meeting.analysis = {
      summary: aiOutput.summary,
      decisions: aiOutput.decisions,
      followUpSuggestions: aiOutput.followUpSuggestions
    };
    await meeting.save();

    // Map and dump extracted action items into Action Items Collection
    const actionItemPromises = aiOutput.actionItems.map(item => {
      // Automatically set default dueDate 5 days from the meeting date
      const calculatedDueDate = new Date(meeting.meetingDate);
      calculatedDueDate.setDate(calculatedDueDate.getDate() + 5);

      return ActionItem.create({
        meetingId: meeting._id,
        task: item.task,
        assignee: item.assignee,
        citations: item.citations,
        dueDate: calculatedDueDate,
        status: 'PENDING'
      });
    });

    const savedActionItems = await Promise.all(actionItemPromises);

    res.json({
      traceId: req.traceId,
      success: true,
      data: {
        summary: meeting.analysis.summary,
        decisions: meeting.analysis.decisions,
        followUpSuggestions: meeting.analysis.followUpSuggestions,
        actionItems: savedActionItems
      }
    });
  } catch (error) { next(error); }
};