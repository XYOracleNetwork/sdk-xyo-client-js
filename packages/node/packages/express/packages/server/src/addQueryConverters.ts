import { dependencies } from '@xyo-network/express-node-dependencies'
import { QueryConverterRegistry } from '@xyo-network/express-node-lib'
import { isProduction } from '@xyo-network/express-node-middleware'
import {
  DebugPayload,
  DebugQuery,
  DebugSchema,
  GetArchivePermissionsPayload,
  GetArchivePermissionsQuery,
  GetArchivePermissionsSchema,
  GetDomainConfigPayload,
  GetDomainConfigQuery,
  GetDomainConfigSchema,
  GetSchemaPayload,
  GetSchemaQuery,
  GetSchemaSchema,
  Query,
  SetArchivePermissionsPayload,
  SetArchivePermissionsQuery,
  SetArchivePermissionsSchema,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayload } from '@xyo-network/payload-model'
import { Request } from 'express'
import { v4 } from 'uuid'

import { XyoQueryPayloadWithMeta } from './XyoQueryPayloadWithMeta'

const debugCommandConverter = (payload: XyoPayload, _req: Request): Query => {
  return {
    id: v4(),
    payload,
  } as Query
}

export const addQueryConverters = () => {
  const registry = dependencies.get<QueryConverterRegistry>(TYPES.PayloadToQueryConverterRegistry)
  if (!isProduction()) {
    addDebugQueries(registry)
  }
  addQueryHandlers(registry)
}

export const addDebugQueries = (registry: QueryConverterRegistry) => {
  registry.registerConverterForSchema(DebugSchema, (payload: XyoQueryPayloadWithMeta<DebugPayload>, _req: Request) => new DebugQuery(payload))
  registry.registerConverterForSchema('network.xyo.test', debugCommandConverter)
}

export const addQueryHandlers = (registry: QueryConverterRegistry) => {
  registry.registerConverterForSchema(
    SetArchivePermissionsSchema,
    (payload: XyoQueryPayloadWithMeta<SetArchivePermissionsPayload>, _req: Request) => new SetArchivePermissionsQuery(payload),
  )
  registry.registerConverterForSchema(
    GetArchivePermissionsSchema,
    (payload: XyoQueryPayloadWithMeta<GetArchivePermissionsPayload>, _req: Request) => new GetArchivePermissionsQuery(payload),
  )
  registry.registerConverterForSchema(
    GetDomainConfigSchema,
    (payload: XyoQueryPayloadWithMeta<GetDomainConfigPayload>, _req: Request) => new GetDomainConfigQuery(payload),
  )
  registry.registerConverterForSchema(
    GetSchemaSchema,
    (payload: XyoQueryPayloadWithMeta<GetSchemaPayload>, _req: Request) => new GetSchemaQuery(payload),
  )
}
