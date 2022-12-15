import { JobQueue } from '@xyo-network/node-core-model'
import { Job } from '@xyo-network/shared'

export const scheduleJobs = async (jobQueue: JobQueue, jobs: Job[]) => {
  await Promise.all(jobs.map(async (job) => await jobQueue.every(job.schedule, job.name)))
}
