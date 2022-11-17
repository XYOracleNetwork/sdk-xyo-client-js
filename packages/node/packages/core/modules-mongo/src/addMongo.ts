import { Container } from 'inversify'

import { ArchivistContainerModule, ArchivistFactoryContainerModule } from './Archivist'
import { getDivinerContainerModule } from './Diviner'
import { JobQueueContainerModule } from './JobQueue'
import { ManagerContainerModule } from './Manager'

export const addMongo = async (container: Container) => {
  container.load(ArchivistContainerModule)
  container.load(ArchivistFactoryContainerModule)
  container.load(await getDivinerContainerModule(container))
  container.load(ManagerContainerModule)
  container.load(JobQueueContainerModule)
}
