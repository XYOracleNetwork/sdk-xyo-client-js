import { Job } from '@xyo-network/shared'
import { mock, MockProxy } from 'jest-mock-extended'

import { JobQueue } from '../../../../../packages/packages-clients/node/packages/core/packages/model/src'
import { defineJobs } from '../defineJobs'

describe('defineJobs', () => {
  let jobQueue: MockProxy<JobQueue>
  let jobs: Job[] = []
  beforeEach(() => {
    jobQueue = mock<JobQueue>()
    jobs = [mock<Job>()]
  })
  it('defines the supplied jobs', () => {
    defineJobs(jobQueue, jobs)
  })
})
