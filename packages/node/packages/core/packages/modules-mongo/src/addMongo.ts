import { Container } from 'inversify'

import { addArchivistModuleFactories } from './Archivist'
import { addDivinerModuleFactories } from './Diviner'
import { JobQueueContainerModule } from './JobQueue'
import { initializeDatabase } from './Mongo'

export const addMongoModules = async (container: Container) => {
  await initializeDatabase()
  container.load(JobQueueContainerModule)
  addArchivistModuleFactories(container)
  addDivinerModuleFactories(container)
}
