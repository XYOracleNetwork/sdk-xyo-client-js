import { Job } from '@xyo-network/shared'
import { DefineOptions } from 'agenda'

import { JobQueue } from '../../../../packages/packages-clients/node/packages/core/packages/model/src'

// TODO: Depends on job schedule, calculate dynamically
// to something like 25% of schedule to allow for retries
const options: DefineOptions = { lockLifetime: 10000 }

export const defineJobs = (jobQueue: JobQueue, jobs: Job[]) => {
  jobs.map((job) => jobQueue.define(job.name, options, job.task))
}
