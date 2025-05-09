import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from '@firebase/firestore'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Hash } from '@xylabs/hex'
import { AbstractArchivist, StorageClassLabel } from '@xyo-network/archivist-abstract'
import { ArchivistInsertQuerySchema, ArchivistModuleEventData } from '@xyo-network/archivist-model'
import { creatableModule } from '@xyo-network/module-model'
import {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'

import { FirebaseArchivistConfigSchema } from './Config.ts'
import { FirebaseArchivistParams } from './Params.ts'

@creatableModule()
export class FirebaseArchivist<
  TParams extends FirebaseArchivistParams = FirebaseArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, FirebaseArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = FirebaseArchivistConfigSchema
  static override readonly labels = { ...super.labels, [StorageClassLabel]: 'network' }

  override get queries() {
    return [
      ArchivistInsertQuerySchema,
      ...super.queries,
    ]
  }

  private get collection() {
    return collection(this.firestore, assertEx(this.config.collection, () => 'Missing collection name'))
  }

  private get firebaseApp() {
    return assertEx(this.params.firebaseApp, () => 'Missing FirebaseApp')
  }

  private get firestore() {
    return getFirestore(this.firebaseApp, assertEx(this.config.dbId, () => 'no dbId specified'))
  }

  protected override async getHandler(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    const payloadCollection = this.collection
    return (await Promise.all(hashes.map(async (hash) => {
      const docRef = doc(payloadCollection, hash)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        return null
      }
      return docSnap.data() as WithStorageMeta<Payload>
    }))).filter(exists)
  }

  protected override async insertHandler(payloads: WithStorageMeta<Payload>[]): Promise<WithStorageMeta<Payload>[]> {
    const payloadCollection = this.collection
    return await Promise.all(payloads.map(
      async (payload) => {
        const docRef = doc(payloadCollection, payload._hash)
        await setDoc(docRef, payload)
        return payload
      },
    ))
  }
}
