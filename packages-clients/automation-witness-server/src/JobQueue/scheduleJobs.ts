import { Job } from '@xyo-network/shared'

import { JobQueue } from '../../../../packages/packages-clients/node/packages/core/packages/model/src'

export const scheduleJobs = async (jobQueue: JobQueue, jobs: Job[]) => {
  await Promise.all(jobs.map(async (job) => await jobQueue.every(job.schedule, job.name)))
}
