import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleError, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'

export type ModuleQueryResult = [WithMeta<BoundWitness>, PayloadWithMeta[], WithMeta<ModuleError>[]]
