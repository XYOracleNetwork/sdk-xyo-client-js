import axios from 'axios'

import { GoogleDnsResult } from './GoogleDnsResult'

const googleDnsOverHttps = async (name: string) => {
  return (await axios.get<GoogleDnsResult>(`https://dns.google/resolve?name=${name}`)).data
}

export { googleDnsOverHttps }
