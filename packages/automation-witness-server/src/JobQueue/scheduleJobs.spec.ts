import { JobQueue } from '@xyo-network/node-core-model'
import { Job } from '@xyo-network/shared'
import { mock, MockProxy } from 'jest-mock-extended'

import { scheduleJobs } from './scheduleJobs'

describe('scheduleJobs', () => {
  let jobQueue: MockProxy<JobQueue>
  let jobs: Job[] = []
  beforeEach(() => {
    jobQueue = mock<JobQueue>()
    jobs = [mock<Job>()]
  })
  it('schedules the supplied jobs', async () => {
    await scheduleJobs(jobQueue, jobs)
  })
})
