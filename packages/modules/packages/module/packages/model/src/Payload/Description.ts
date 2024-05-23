import { Payload } from '@xyo-network/payload-model'

import { ModuleDescription } from '../ModuleDescription'

export const ModuleDescriptionSchema = 'network.xyo.module.description' as const
export type ModuleDescriptionSchema = typeof ModuleDescriptionSchema

export type ModuleDescriptionPayload = Payload<ModuleDescription, ModuleDescriptionSchema>
