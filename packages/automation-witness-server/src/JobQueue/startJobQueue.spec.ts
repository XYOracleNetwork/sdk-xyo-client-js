import { JobQueue } from '@xyo-network/node-core-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { startJobQueue } from './startJobQueue'

describe('startJobQueue', () => {
  let jobQueue: MockProxy<JobQueue>
  beforeEach(() => {
    jobQueue = mock<JobQueue>()
  })
  it('starts the job queue', async () => {
    await startJobQueue(jobQueue)
    expect(jobQueue.start).toHaveBeenCalledOnce()
  })
})
