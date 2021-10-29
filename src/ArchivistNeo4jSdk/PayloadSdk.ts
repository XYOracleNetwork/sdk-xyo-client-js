import { assertEx } from '@xyo-network/sdk-xyo-js'
import neo4j from 'neo4j-driver'
import { Driver } from 'neo4j-driver-core'

import { XyoPayload } from '../models'
import { XyoPayloadWrapper } from '../Payload'

class PayloadSdk {
  private _archive: string
  private _driver?: Driver
  constructor(url: string, un: string, pw: string, archive: string) {
    this._archive = archive
    this._driver = neo4j.driver(url, neo4j.auth.basic(un, pw))
  }

  public close() {
    this._driver?.close()
    this._driver = undefined
  }

  public async fetchCount() {
    const session = this._driver?.session()
    try {
      return (await session?.run('MATCH (n:Payload) RETURN COUNT(n) as count'))?.records[0].get('count') as number
    } finally {
      session?.close()
    }
  }

  public async insert(item: XyoPayload) {
    const _timestamp = Date.now()
    const wrapper = new XyoPayloadWrapper(item)
    const session = this._driver?.session()
    try {
      return (
        await session?.run(
          `CREATE n:Payload ${JSON.stringify({ ...item, _timestamp, hash: wrapper.sortedHash() })} RETURN n`
        )
      )?.records.map((record) => record.toObject() as XyoPayload)
    } finally {
      session?.close()
    }
  }

  public async findByHash(hash: string) {
    const session = this._driver?.session()
    try {
      return (await session?.run(`MATCH (n:Payload) ${hash} RETURN n`))?.records.map(
        (record) => record.toObject() as XyoPayload
      )
    } finally {
      session?.close()
    }
  }

  public async sample(size: number) {
    assertEx(size <= 10, `size must be <= 10 [${size}]`)
    const session = this._driver?.session()
    const count = await this.fetchCount()
    const randomOffset = Math.random() * count
    try {
      return (
        await session?.run(`START t=node(*) 
      MATCH (a)-[:LEADS_TO]->(t) 
      RETURN a
      SKIP {${randomOffset}} LIMIT {size}`)
      )?.records.map((record) => record.toObject() as XyoPayload)
    } finally {
      session?.close()
    }
  }

  public async insertMany(items: XyoPayload[]) {
    const _timestamp = Date.now()
    const session = this._driver?.session()
    try {
      let results: XyoPayload[] = []
      const promises = items.map(async (item) => {
        const wrapper = new XyoPayloadWrapper(item)
        results = results.concat(
          (
            await session?.run(
              `CREATE n:Payload ${JSON.stringify({ ...item, _timestamp, hash: wrapper.sortedHash() })} RETURN n`
            )
          )?.records.map((record) => record.toObject() as XyoPayload) ?? []
        )
      })
      await Promise.allSettled(promises)
    } finally {
      session?.close()
    }
  }
}

export default PayloadSdk
