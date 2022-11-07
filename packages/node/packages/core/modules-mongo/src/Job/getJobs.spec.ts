import { Job } from '@xyo-network/shared'
import { Container } from 'inversify'
import { mock, MockProxy } from 'jest-mock-extended'

import { getJobs } from './getJobs'

describe('getJobs', () => {
  const container: MockProxy<Container> = mock<Container>()
  container.getAll.mockReturnValue([
    {
      jobs: [mock<Job>()],
    },
  ])
  it('gets the jobs', () => {
    const jobs = getJobs(container)
    expect(jobs).toBeArray()
    expect(jobs.length).toBeGreaterThan(0)
  })
})
