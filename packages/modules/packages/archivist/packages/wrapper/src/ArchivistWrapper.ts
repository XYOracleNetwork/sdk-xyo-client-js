import { ArchivistModule, isArchivistInstance, isArchivistModule } from '@xyo-network/archivist-model'

import { IndirectArchivistWrapper } from './IndirectArchivistWrapper'
export class ArchivistWrapper<TWrappedModule extends ArchivistModule = ArchivistModule>
  extends IndirectArchivistWrapper<TWrappedModule>
  implements ArchivistModule<TWrappedModule['params']>
{
  static override instanceIdentityCheck = isArchivistInstance
  static override moduleIdentityCheck = isArchivistModule
}
