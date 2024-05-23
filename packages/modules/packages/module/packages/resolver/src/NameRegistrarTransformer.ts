import { Address } from '@xylabs/hex'
import { DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { ModuleIdentifier, ModuleIdentifierTransformer } from '@xyo-network/module-model'
import { LRUCache } from 'lru-cache'

export class NameRegistrarTransformer implements ModuleIdentifierTransformer {
  private _cache: LRUCache<ModuleIdentifier, ModuleIdentifier> = new LRUCache<ModuleIdentifier, ModuleIdentifier>({ max: 1000, ttl: 1000 * 5 })

  constructor(
    private registrarDiviner: DivinerInstance,
    private root: string,
  ) {}

  async transform(identifier: ModuleIdentifier): Promise<ModuleIdentifier> {
    const parts = identifier.split(':')
    const first = parts.shift()
    const nameParts = first?.split('.')
    if (nameParts?.length === 2 && nameParts[1] === this.root) {
      //check cache
      const cachedResult = this._cache.get(identifier)
      if (cachedResult) return cachedResult

      //not cached, so check registrar
      const query = { domain: nameParts[0], order: 'desc' as const, schema: PayloadDivinerQuerySchema, tld: nameParts[1] }
      const result = await this.registrarDiviner?.divine([query])
      const resultPayload = result?.shift()
      if (!resultPayload) {
        throw new Error(`Unable to resolve registrar name (failed) [${first}]`)
      }
      //TODO: Use proper types for this check
      if (resultPayload) {
        const address = (resultPayload as unknown as { address: Address[] }).address?.shift()
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
