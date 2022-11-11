import { exists } from '@xylabs/exists'
import { dependencies } from '@xyo-network/express-node-dependencies'
import { JobQueue } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Job, JobProvider } from '@xyo-network/shared'

export const initializeJobs = async () => {
  const jobs = (await dependencies.getAllAsync<JobProvider>(TYPES.JobProvider)).flatMap((provider) => provider?.jobs).filter(exists)
  const jobQueue = dependencies.get<JobQueue>(TYPES.JobQueue)
  defineJobs(jobQueue, jobs)
  await jobQueue.start()
  await scheduleJobs(jobQueue, jobs)
}

const scheduleJobs = async (jobQueue: JobQueue, jobs: Job[]) => {
  await Promise.all(jobs.map(async (job) => await jobQueue.every(job.schedule, job.name)))
}

// TODO: Depends on job schedule, calculate dynamically
// to something like 25% of schedule to allow for retries
const options = { lockLifetime: 10000 }

const defineJobs = (jobQueue: JobQueue, jobs: Job[]) => {
  jobs.map((job) => {
    const { name, task } = job
    jobQueue.define(name, options, task)
    if (job.onComplete) jobQueue.on(`complete:${name}`, job.onComplete)
    if (job.onFail) jobQueue.on(`fail:${name}`, job.onFail)
    if (job.onStart) jobQueue.on(`start:${name}`, job.onStart)
    if (job.onSuccess) jobQueue.on(`success:${name}`, job.onSuccess)
  })
}
