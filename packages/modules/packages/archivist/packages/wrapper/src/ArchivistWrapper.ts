import { ArchivistModule } from '@xyo-network/archivist-model'

import { IndirectArchivistWrapper } from './IndirectArchivistWrapper'
/** @deprecated use DirectArchivistWrapper or IndirectArchivistWrapper instead */
export class ArchivistWrapper<TWrappedModule extends ArchivistModule = ArchivistModule>
  extends IndirectArchivistWrapper<TWrappedModule>
  implements ArchivistModule<TWrappedModule['params']> {}
