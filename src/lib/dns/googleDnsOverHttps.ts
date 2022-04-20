import axios from 'axios'

import { DnsRecordType } from './DnsRecordType'
import { GoogleDnsResult } from './GoogleDnsResult'

const googleDnsOverHttps = async (name: string, type = DnsRecordType.A) => {
  return (await axios.get<GoogleDnsResult>(`https://dns.google/resolve?name=${name}&type=${type}`)).data
}

export { googleDnsOverHttps }
