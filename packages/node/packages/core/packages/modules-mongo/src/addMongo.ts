import { Container } from 'inversify'

import { addArchivistConfigModuleFactories } from './Archivist'
import { addDivinerConfigModuleFactories } from './Diviner'
import { JobQueueContainerModule } from './JobQueue'
import { initializeDatabase } from './Mongo'

export const addMongo = async (container: Container) => {
  await initializeDatabase()
  addArchivistConfigModuleFactories(container)
  addDivinerConfigModuleFactories(container)
  container.load(JobQueueContainerModule)
}
