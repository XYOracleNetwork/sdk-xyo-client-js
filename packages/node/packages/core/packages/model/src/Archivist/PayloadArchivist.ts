import { Archivist, ArchivistParams } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AbstractModule } from '@xyo-network/module'

import { XyoPayloadWithMeta, XyoPayloadWithPartialMeta } from '../Payload'
import { XyoPayloadFilterPredicate } from './XyoPayloadFilterPredicate'

export type PayloadArchivist<T extends AnyObject = AnyObject, TParams extends ArchivistParams = ArchivistParams> = Archivist<
  XyoPayloadWithMeta<T> | null,
  XyoBoundWitness | null,
  XyoPayloadWithPartialMeta<T>,
  XyoPayloadWithMeta<T> | null,
  XyoPayloadFilterPredicate<T>,
  string
> &
  AbstractModule<TParams>
