import { XyoBoundWitness, XyoPayload } from '@xyo-network/core'

import { XyoApiConfig } from '../../models'
import { XyoApiSimple, XyoApiSimpleQuery } from '../../Simple'
import { WithArchive } from '../../WithArchive'

export class XyoArchivistNodeApi<
  D extends XyoBoundWitness | XyoBoundWitness[] = XyoBoundWitness | XyoBoundWitness[],
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>
> extends XyoApiSimple<string[][], D, XyoApiSimpleQuery, C> {
  /**
   * Get the result of a previously issued query (if available)
   * @param queryId Query ID from a previously issued query
   * @returns The result of the query (if available)
   */
  public result<T extends XyoPayload = XyoPayload>(queryId: string): XyoApiSimple<XyoPayload> {
    return new XyoApiSimple<T>({
      ...this.config,
      root: `/query/${queryId}/`,
    })
  }

  /**
   * Issue the supplied queries and wait (non-blocking) for the results
   * @param data The queries to issue
   * @returns The results for the issued queries
   */
  public async perform(data: D) {
    const ids = await this.post(data)
    // TODO: Polling interval for long running, etc.
    const results = ids?.length ? Promise.all(ids?.map((bw) => Promise.all(bw.map((p) => this.result(p).get('tuple'))))) : []
    // TODO: Unpack results
    return []
  }
}
