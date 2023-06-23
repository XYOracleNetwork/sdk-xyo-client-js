import Url from 'url-parse'

export type Query = Record<string, string | undefined>

export type ParsedUrl<TQuery extends Query = Query> = Url<TQuery>

export const toUrl = <TQuery extends Query = Query>(url?: string): Url<TQuery> | undefined => {
  if (!url) return undefined
  try {
    return new Url<TQuery>(url)
  } catch (e) {
    return undefined
  }
}
