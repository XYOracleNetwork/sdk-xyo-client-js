import { JobQueue } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { ContainerModule, interfaces } from 'inversify'

import { getJobQueue } from './getJobQueue'

export const JobQueueContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<JobQueue>(TYPES.JobQueue).toConstantValue(getJobQueue())
})
