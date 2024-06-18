// Here’s a quick overview of the cron syntax:

// * * * * * *
// ┬ ┬ ┬ ┬ ┬ ┬
// │ │ │ │ │ │
// │ │ │ │ │ └ day of week (0 - 7) (Sunday=0 or 7)
// │ │ │ │ └───── month (1 - 12)
// │ │ │ └────────── day of month (1 - 31)
// │ │ └─────────────── hour (0 - 23)
// │ └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, optional)
// Examples
// * * * * *: Every minute
// 0 * * * *: Every hour
// 0 0 * * *: Every day at midnight
// 0 0 * * 0: Every Sunday at midnight

// const cron = require('node-cron');

// // Schedule a task to run every minute
// cron.schedule('* * * * *', () => {
//   console.log('Running a task every minute');
// });

// // Schedule a task to run at a specific time, for example, 2:30 AM every day
// cron.schedule('30 2 * * *', () => {
//   console.log('Running a task at 2:30 AM');
// });

// // You can also use cron syntax to specify more complex schedules
// // For example, run a task every Monday at 7:00 AM
// cron.schedule('0 7 * * 1', () => {
//   console.log('Running a task every Monday at 7:00 AM');
// });

// // Keep the script running
// process.stdin.resume();


const express = require('express');
const http = require('http');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 8008;

// Log file path
const logFilePath = path.join(__dirname, 'data.txt');

// Function to delay execution by specified milliseconds
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to write log messages
const writeLog = (message) => {
  fs.appendFileSync(logFilePath, message);
  console.log(message);
  io.emit('newLog', message);
};

// Function to check condition and emit event
const checkConditionAndEmit = () => {
  const conditionMet = true; // Replace this with your actual condition
  if (conditionMet) {
    const message = `Condition met at: ${new Date().toLocaleString()}\n`;
    io.emit('conditionMet', message);
  }
};

// Start server and setup cron jobs
(async () => {
  console.log('Node.js application started');

  // Delay for 30 seconds before starting the tasks
  await delay(30000);

  cron.schedule('* * * * *', () => {
    const message = `Running a task every minute: ${new Date().toLocaleString()}\n`;
    writeLog(message);
    checkConditionAndEmit();
  });

  cron.schedule('*/2 * * * *', () => {
    const message =`Running a task every 2 minutes: ${new Date().toLocaleString()}\n`;
    writeLog(message);
  });
})();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get log content
app.get('/logs', (req, res) => {
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading log file');
      return;
    }
    res.send(data);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});