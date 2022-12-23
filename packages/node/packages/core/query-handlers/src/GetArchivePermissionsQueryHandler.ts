import 'reflect-metadata'

import { assertEx } from '@xylabs/assert'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { WithAdditional } from '@xyo-network/core'
import {
  ArchivePermissionsArchivistFactory,
  GetArchivePermissionsQuery,
  QueryHandler,
  SetArchivePermissionsPayload,
  SetArchivePermissionsPayloadWithMeta,
  SetArchivePermissionsSchema,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { inject, injectable } from 'inversify'

const getEmptyPermissions = (query: GetArchivePermissionsQuery): XyoPayloadWithMeta<SetArchivePermissionsPayload> => {
  return new XyoPayloadBuilder<WithAdditional<XyoPayloadWithMeta<SetArchivePermissionsPayload>>>({ schema: SetArchivePermissionsSchema })
    .fields({
      _queryId: query.id,
      _timestamp: Date.now(),
    })
    .build()
}

@injectable()
export class GetArchivePermissionsQueryHandler implements QueryHandler<GetArchivePermissionsQuery, SetArchivePermissionsPayload> {
  constructor(@inject(TYPES.ArchivePermissionsArchivistFactory) protected readonly archivistFactory: ArchivePermissionsArchivistFactory) {}
  async handle(query: GetArchivePermissionsQuery): Promise<XyoPayloadWithMeta<SetArchivePermissionsPayload>> {
    const archive = assertEx(query.payload._archive, 'GetArchivePermissionsQueryHandler.handle: Archive not supplied')
    const wrapper = new ArchivistWrapper(this.archivistFactory(archive))
    const getResult = await wrapper.get([archive])
    const permissions = (getResult?.[0] as SetArchivePermissionsPayload) || getEmptyPermissions(query)
    return new XyoPayloadBuilder<SetArchivePermissionsPayloadWithMeta>({ schema: SetArchivePermissionsSchema })
      .fields({ ...permissions, _queryId: query.id, _timestamp: Date.now() })
      .build()
  }
}
