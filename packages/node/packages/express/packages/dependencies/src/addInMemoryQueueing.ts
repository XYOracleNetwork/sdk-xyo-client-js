import { IdentifiableHuri, Query, Queue } from '@xyo-network/node-core-model'
import { InMemoryQueue } from '@xyo-network/node-core-modules-memory'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

export const addInMemoryQueueing = (container: Container) => {
  container.bind<Queue<Query>>(TYPES.QueryQueue).toConstantValue(new InMemoryQueue<Query>())
  container.bind<Queue<IdentifiableHuri>>(TYPES.ResponseQueue).toConstantValue(new InMemoryQueue<IdentifiableHuri>())
}
