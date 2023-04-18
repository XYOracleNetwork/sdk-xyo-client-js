import { Container } from 'inversify'

import { addArchivistConfigModuleFactories } from './Archivist'
import { addDivinerConfigModuleFactories } from './Diviner'
import { JobQueueContainerModule } from './JobQueue'
import { SdkContainerModule } from './Mongo'

export const addMongo = async (container: Container) => {
  await container.loadAsync(SdkContainerModule)
  addArchivistConfigModuleFactories(container)
  addDivinerConfigModuleFactories(container)
  container.load(JobQueueContainerModule)
}
