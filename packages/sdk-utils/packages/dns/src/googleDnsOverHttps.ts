import { axios } from '@xylabs/axios'

import { DnsRecordType } from './DnsRecordType.ts'
import type { GoogleDnsResult } from './GoogleDnsResult.ts'

const googleDnsOverHttps = async (name: string, type: DnsRecordType = DnsRecordType.A) => {
  return (await axios.get<GoogleDnsResult>(`https://dns.google/resolve?name=${name}&type=${type}`)).data
}

export { googleDnsOverHttps }
