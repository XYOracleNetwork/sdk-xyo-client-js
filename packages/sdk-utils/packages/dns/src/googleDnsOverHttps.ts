import { axios } from '@xylabs/axios'

import { DnsRecordType } from './DnsRecordType.js'
import { GoogleDnsResult } from './GoogleDnsResult.js'

const googleDnsOverHttps = async (name: string, type = DnsRecordType.A) => {
  return (await axios.get<GoogleDnsResult>(`https://dns.google/resolve?name=${name}&type=${type}`)).data
}

export { googleDnsOverHttps }
