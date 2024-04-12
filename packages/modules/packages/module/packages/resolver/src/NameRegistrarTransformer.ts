import { Address } from '@xylabs/hex'
import { Base, BaseParams, toJsonString } from '@xylabs/object'
import { DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { ModuleIdentifier, ModuleIdentifierTransformer } from '@xyo-network/module-model'
import { LRUCache } from 'lru-cache'

export interface NameRegistrarTransformerParams extends BaseParams {
  registrarDiviner: DivinerInstance
  tld: string
}

export class NameRegistrarTransformer extends Base<NameRegistrarTransformerParams> implements ModuleIdentifierTransformer {
  private _cache: LRUCache<ModuleIdentifier, ModuleIdentifier> = new LRUCache<ModuleIdentifier, ModuleIdentifier>({ max: 1000, ttl: 1000 * 5 })

  async transform(identifier: ModuleIdentifier): Promise<ModuleIdentifier> {
    const parts = identifier.split(':')
    const first = parts.shift()
    const nameParts = first?.split('.')
    if (nameParts?.length === 2 && nameParts[1] === this.params.tld) {
      //check cache
      const cachedResult = this._cache.get(identifier)
      if (cachedResult) return cachedResult

      //not cached, so check registrar
      const query = { domain: nameParts[0], order: 'desc' as const, schema: PayloadDivinerQuerySchema, tld: nameParts[1] }
      this.logger?.debug('query:', toJsonString(query))
      const result = await this.params.registrarDiviner?.divine([query])
      this.logger?.debug('result:', toJsonString(result))
      const resultPayload = result?.shift()
      if (!resultPayload) {
        throw new Error(`Unable to resolve registrar name (failed) [${first}]`)
      }
      //TODO: Use proper types for this check
      if (resultPayload) {
        const address = (resultPayload as unknown as { address: Address[] }).address?.shift()
        this.logger?.debug('address:', toJsonString(address))
        if (address) {
          this._cache.set(identifier, address)
          return address
        }
      }
      throw new Error(`Unable to resolve registrar name (not found) [${first}]`)
    }
    return identifier
  }
}
