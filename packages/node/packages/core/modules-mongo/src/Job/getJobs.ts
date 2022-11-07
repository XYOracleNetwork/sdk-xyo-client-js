import { exists } from '@xylabs/exists'
import { TYPES } from '@xyo-network/node-core-types'
import { Job, JobProvider } from '@xyo-network/shared'
import { Container } from 'inversify'

// TODO: This is no longer Mongo-specific and can be
// exposed in a non-DB module
export const getJobs = (container: Container): Job[] => {
  return container
    .getAll<JobProvider>(TYPES.JobProvider)
    .flatMap((provider) => provider?.jobs)
    .filter(exists)
}
