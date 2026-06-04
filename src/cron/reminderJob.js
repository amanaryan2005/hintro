import cron from 'node-cron';
import axios from 'axios';
import { ActionItem } from '../models/ActionItem.js';

export const initReminderScheduler = () => {
  // Execute checks routinely every hour
  cron.schedule('0 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Initiating background sweep for overdue tasks...`);
    try {
      const webhookUrl = process.env.EXTERNAL_WEBHOOK_URL;
      if (!webhookUrl) {
        console.warn("External integration webhook missing. Skipping automation notification payload.");
        return;
      }

      // Identify overdue tasks that haven't been completed yet
      const overdueItems = await ActionItem.find({
        status: { $ne: 'COMPLETED' },
        dueDate: { $lt: new Date() }
      });

      for (const item of overdueItems) {
        // Build the reminder message payload
        const formattedDate = new Date(item.dueDate).toISOString().split('T')[0];
        const alertMessage = `🚨 **Overdue Action Item Alert**\n**Task:** ${item.task}\n**Assigned To:** ${item.assignee}\n**Due Date:** ${formattedDate}`;

        // Post structured content directly to Slack/Discord webhook
        await axios.post(webhookUrl, { text: alertMessage });

        // Update item history to record that a notification was sent
        item.remindersSent.push({ sentAt: new Date() });
        await item.save();
      }

      console.log(`Successfully completed notification sweeping. Notified ${overdueItems.length} items.`);
    } catch (error) {
      console.error("Critical error run inside automated tracking worker engine: ", error.message);
    }
  });
};