const { Queue } = require('bullmq');
const { REDIS_CONFIG } = require('./config');

async function checkQueue() {
  const queue = new Queue('judge-cluster', { connection: REDIS_CONFIG });
  const jobs = await queue.getJobs(['completed', 'failed', 'delayed', 'active', 'waiting']);
  if(jobs.length > 0) {
     console.log("Latest job data:", jobs[jobs.length-1].data);
  } else {
     console.log("No jobs found");
  }
  process.exit(0);
}
checkQueue();
