import { axiosJson } from '@xylabs/sdk-js'

import { DnsRecordType } from './DnsRecordType.ts'
import type { GoogleDnsResult } from './GoogleDnsResult.ts'

const googleDnsOverHttps = async (name: string, type: DnsRecordType = DnsRecordType.A) => {
  return (await axiosJson.get<GoogleDnsResult>(`https://dns.google/resolve?name=${name}&type=${type}`)).data
}

export { googleDnsOverHttps }
