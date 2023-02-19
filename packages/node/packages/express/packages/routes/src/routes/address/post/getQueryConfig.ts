import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { requestCanAccessArchive } from '@xyo-network/express-node-lib'
import { AbstractModule, Module, ModuleConfig, ModuleConfigSchema, XyoQueryBoundWitness } from '@xyo-network/module'
import { ArchiveModuleConfig } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Request } from 'express'

export const getQueryConfig = async (
  mod: Module,
  req: Request,
  bw: XyoQueryBoundWitness,
  payloads?: XyoPayload[],
): Promise<ModuleConfig | undefined> => {
  const archivist = mod as unknown as AbstractModule
  const config = archivist?.config as unknown as ArchiveModuleConfig
  const archive = config?.archive
  if (archive && (await requestCanAccessArchive(req, archive))) {
    // Recurse through payloads for nested BWs
    const nestedBwAddresses =
      payloads
        ?.flat(5)
        .filter<XyoBoundWitness>((payload): payload is XyoBoundWitness => payload?.schema === XyoBoundWitnessSchema)
        .map((bw) => bw.addresses) || []
    const addresses = [bw.addresses, ...nestedBwAddresses].filter((address) => address.length)
    const allowed = addresses.length ? Object.fromEntries(archivist.queries.map((schema) => [schema, addresses])) : {}
    const security = { allowed }
    return { schema: ModuleConfigSchema, security }
  }
}
