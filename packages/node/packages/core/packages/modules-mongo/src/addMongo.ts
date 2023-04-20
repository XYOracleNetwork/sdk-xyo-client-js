import { Container } from 'inversify'

import { addArchivistConfigModuleFactories } from './Archivist'
import { addDivinerConfigModuleFactories } from './Diviner'
import { JobQueueContainerModule } from './JobQueue'
import { initializeDatabase } from './Mongo'

export const addMongoModules = async (container: Container) => {
  await initializeDatabase()
  container.load(JobQueueContainerModule)
  addArchivistConfigModuleFactories(container)
  addDivinerConfigModuleFactories(container)
}
