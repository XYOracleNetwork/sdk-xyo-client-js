import { Archivist } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AbstractModule, ModuleConfig } from '@xyo-network/module'

import { XyoPayloadWithMeta, XyoPayloadWithPartialMeta } from '../Payload'
import { XyoPayloadFilterPredicate } from './XyoPayloadFilterPredicate'

export type PayloadArchivist<T extends AnyObject = AnyObject, TConfig extends ModuleConfig = ModuleConfig> = Archivist<
  XyoPayloadWithMeta<T> | null,
  XyoBoundWitness | null,
  XyoPayloadWithPartialMeta<T>,
  XyoPayloadWithMeta<T> | null,
  XyoPayloadFilterPredicate<T>,
  string
> &
  AbstractModule<TConfig>
