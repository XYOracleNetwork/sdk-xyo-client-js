import { MemoryNode } from '@xyo-network/node'
import { Payload } from '@xyo-network/payload-model'
import { MemorySentinel, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'

export const reportDivinerResult = async (payload: Payload): Promise<Payload[]> => {
  const adHocWitnessAccount = await getAccount(WalletPaths.CryptoMarket.AdHocWitness.AssetDivinerResult)
  const archivists = await getArchivists()
  const witnesses = [await AdhocWitness.create({ account: adHocWitnessAccount, config: { payload, schema: AdhocWitnessConfigSchema } })]
  const modules = [...archivists, ...witnesses]
  const node = await MemoryNode.create()
  await Promise.all(
    modules.map(async (mod) => {
      await node.register(mod)
      await node.attach(mod.address)
    }),
  )
  const config: SentinelConfig = {
    archivists: archivists.map((mod) => mod.address),
    schema: SentinelConfigSchema,
    witnesses: witnesses.map((mod) => mod.address),
  }
  const sentinelAccount = await getAccount(WalletPaths.CryptoMarket.Sentinel.AssetDivinerResult)
  const sentinel = await MemorySentinel.create({ account: sentinelAccount, config })
  await node.register(sentinel)
  await node.attach(sentinelAccount.address, true)
  const report = await sentinel.report()
  return report
}
