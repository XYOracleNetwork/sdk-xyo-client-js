import { MemoryNode } from '@xyo-network/modules'
import { Payload } from '@xyo-network/payload-model'
import { MemorySentinel, SentinelConfig, SentinelConfigSchema, SentinelModule } from '@xyo-network/sentinel'
import { AdhocWitness, AdhocWitnessConfig, AdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'

export const getDivinerResultPanel = async (prices: Payload): Promise<SentinelModule> => {
  const account = getAccount(WalletPaths.CryptoMarketDivinerResultPanel)
  const archivists = await getArchivists()
  const witnessConfig: AdhocWitnessConfig = { payload: prices, schema: AdhocWitnessConfigSchema }
  const witnesses = [await AdhocWitness.create({ account, config: witnessConfig })]

  const node = await MemoryNode.create()

  const witnessAddresses = await Promise.all(
    witnesses.map(async (witness) => {
      await node.register(witness).attach(witness.address)
      return witness.address
    }),
  )
  await Promise.all(
    archivists.map(async (archivist) => {
      await node.register(archivist).attach(archivist.address)
      return archivist.address
    }),
  )
  const panelConfig: SentinelConfig = {
    archivists: archivists.map((mod) => mod.address),
    schema: SentinelConfigSchema,
    witnesses: witnessAddresses,
  }
  return await MemorySentinel.create({ account, config: panelConfig })
}
