import { Archivist } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { EmptyObject } from '@xyo-network/core'
import { AbstractModule } from '@xyo-network/module'

import { XyoPayloadWithMeta, XyoPayloadWithPartialMeta } from '../Payload'
import { XyoPayloadFilterPredicate } from './XyoPayloadFilterPredicate'

export type PayloadArchivist<T extends EmptyObject = EmptyObject> = Archivist<
  XyoPayloadWithMeta<T> | null,
  XyoBoundWitness | null,
  XyoPayloadWithPartialMeta<T>,
  XyoPayloadWithMeta<T> | null,
  XyoPayloadFilterPredicate<T>,
  string
> &
  AbstractModule
