import { XyoDomainPayload, XyoDomainPayloadWrapper } from '@xyo-network/domain-payload-plugin'
import { GetDomainConfigQuery, Optional, QueryHandler, XyoPartialPayloadMeta } from '@xyo-network/node-core-model'

export class GetDomainConfigQueryHandler implements QueryHandler<GetDomainConfigQuery, XyoDomainPayload> {
  async handle(query: GetDomainConfigQuery): Promise<Optional<XyoPartialPayloadMeta<XyoDomainPayload>>> {
    const config: XyoDomainPayloadWrapper<XyoPartialPayloadMeta<XyoDomainPayload>> | undefined = query.payload.proxy
      ? await XyoDomainPayloadWrapper.discover(query.payload.domain, query.payload.proxy)
      : await XyoDomainPayloadWrapper.discover(query.payload.domain)
    return config?.payload
  }
}
