import { Account } from '@xyo-network/account'
import { XyoPayload } from '@xyo-network/payload'

import { XyoPayloadWithPartialMeta } from '../Payload'

export abstract class Query<T extends XyoPayload = XyoPayload> {
  protected account: Account = Account.random()

  constructor(public readonly payload: XyoPayloadWithPartialMeta<T>) {}
  /**
   * The unique ID for the query. Since we use a different
   * account for each query, we use the public address of the
   * account as a correlation ID for the query.
   * @returns Unique ID for the query
   */
  public get id(): string {
    return `${this.account.addressValue.hex}`
  }
}
