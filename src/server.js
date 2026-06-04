import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { traceAndLogMiddleware } from './middleware/traceAndLog.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/api.js';
import { initReminderScheduler } from './cron/reminderJob.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Essential Global Inbound Transforms
app.use(express.json());

// Apply Trace ID and Structured Logging globally
app.use(traceAndLogMiddleware);

// Bind Master Router Context
app.use(apiRouter);

// Apply Centralized Error Catching globally
app.use(errorHandler);

// Connect to Database and start Server Engine
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected securely to MongoDB Cluster engine.");
    
    // Boot Scheduled Automation Framework Daemon
    initReminderScheduler();

    app.listen(PORT, () => {
      console.log(`Server executing cleanly on node runtime port allocation: ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database boot failure constraint encountered: ", err);
    process.exit(1);
  });