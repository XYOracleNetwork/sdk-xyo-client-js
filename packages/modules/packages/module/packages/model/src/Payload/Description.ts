import type { Payload } from '@xyo-network/payload-model'

import type { ModuleDescription } from '../ModuleDescription.ts'

export const ModuleDescriptionSchema = 'network.xyo.module.description' as const
export type ModuleDescriptionSchema = typeof ModuleDescriptionSchema

export type ModuleDescriptionPayload = Payload<ModuleDescription, ModuleDescriptionSchema>
