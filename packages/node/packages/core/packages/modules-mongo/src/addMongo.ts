import { Container } from 'inversify'

import { ArchivistContainerModule } from './Archivist'
import { DivinerContainerModule } from './Diviner'
import { JobQueueContainerModule } from './JobQueue'
import { ManagerContainerModule } from './Manager'
import { SdkContainerModule } from './Mongo'

export const addMongo = async (container: Container) => {
  await container.loadAsync(SdkContainerModule)
  container.load(ArchivistContainerModule)
  container.load(DivinerContainerModule)
  container.load(ManagerContainerModule)
  container.load(JobQueueContainerModule)
}
