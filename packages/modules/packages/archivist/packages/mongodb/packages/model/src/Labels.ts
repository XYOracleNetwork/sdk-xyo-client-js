import type { Labels } from '@xyo-network/module-model'

export interface ArchivistLabels extends Labels {
  'network.xyo.archivist.persistence.scope': 'memory' | 'thread' | 'process' | 'disk' | 'network'
}
