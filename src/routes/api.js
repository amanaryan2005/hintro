import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createMeeting, getMeeting, listMeetings } from '../controllers/meetingController.js';
import { analyzeMeeting } from '../controllers/analysisController.js';
import { createActionItem, updateStatus, getActionItems, getOverdueActionItems } from '../controllers/actionItemController.js';

const router = Router();

// Base Public Evaluative Mappings
router.get('/health', (req, res) => res.json({ status: "UP" }));
router.get('/api/evaluation', (req, res) => {
  res.json({
    candidateName: "Your Full Name",
    email: "your.email@example.com",
    repositoryUrl: "https://github.com/yourusername/hintro-meeting-intelligence",
    deployedUrl: "https://your-app-url.render.com",
    externalIntegration: "Slack Webhook Link API",
    features: ["Authentication", "AI Analysis System Engine", "Reminder Scheduler Core Background Sync Thread Worker"]
  });
});

// Protected Core Matrix Mappings
router.post('/api/meetings', authMiddleware, createMeeting);
router.get('/api/meetings/:id', authMiddleware, getMeeting);
router.get('/api/meetings', authMiddleware, listMeetings);
router.post('/api/meetings/:id/analyze', authMiddleware, analyzeMeeting);

router.post('/api/action-items', authMiddleware, createActionItem);
router.patch('/api/action-items/:id/status', authMiddleware, updateStatus);
router.get('/api/action-items', authMiddleware, getActionItems);
router.get('/api/action-items/overdue', authMiddleware, getOverdueActionItems);

export default router;