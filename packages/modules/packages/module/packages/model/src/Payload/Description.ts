import { asSchema, type Payload } from '@xyo-network/payload-model'

import type { ModuleDescription } from '../ModuleDescription.ts'

export const ModuleDescriptionSchema = asSchema('network.xyo.module.description', true)
export type ModuleDescriptionSchema = typeof ModuleDescriptionSchema

export type ModuleDescriptionPayload = Payload<ModuleDescription, ModuleDescriptionSchema>
