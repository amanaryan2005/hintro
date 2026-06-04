import { Meeting } from '../models/Meeting.js';

export const createMeeting = async (req, res, next) => {
  try {
    const { title, participants, meetingDate, transcript } = req.body;
    if (!title || !meetingDate) {
      return res.status(400).json({
        traceId: req.traceId,
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Title and meetingDate are mandatory." }
      });
    }

    const meeting = await Meeting.create({
      userId: req.user.id,
      title,
      participants,
      meetingDate,
      transcript: transcript || []
    });

    res.status(201).json({ traceId: req.traceId, success: true, data: meeting });
  } catch (error) { next(error); }
};

export const getMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
    if (!meeting) {
      return res.status(404).json({
        traceId: req.traceId,
        success: false,
        error: { code: "NOT_FOUND", message: "Meeting not found." }
      });
    }
    res.json({ traceId: req.traceId, success: true, data: meeting });
  } catch (error) { next(error); }
};

export const listMeetings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const meetings = await Meeting.find({ userId: req.user.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Meeting.countDocuments({ userId: req.user.id });

    res.json({
      traceId: req.traceId,
      success: true,
      data: { meetings, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
    });
  } catch (error) { next(error); }
};