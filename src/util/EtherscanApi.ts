import nodeFetch from "node-fetch"
import { HttpsProxyAgent } from "https-proxy-agent"
import { setCache, getCache } from "../server_cache/cache"

const ETHERSCAN_URL = "https://api.etherscan.io/api?"

export async function etherscanRequest(
  module: string,
  action: string,
  params: object,
) {
  const query: any = {
    apikey: process.env.APIKEY_ETHERSCAN,
    module: module,
    action: action,
    ...params,
  }

  const url = ETHERSCAN_URL + new URLSearchParams(query)

  const proxy = process.env.HTTP_PROXY || process.env.http_proxy

  if (proxy) {
    const proxyAgent = new HttpsProxyAgent(proxy)

    return nodeFetch(url, { agent: proxyAgent })
  }

  return fetch(url)
}

export async function etherscanGetSource(address: string) {
  const cacheKey = `etherscan_source_${address}`
  const cachedData = getCache(cacheKey)
  if (cachedData) {
    console.log("use cache")
    return cachedData
  }

  const resp = await etherscanRequest("contract", "getsourcecode", { address })
  const data = await resp.json()
  setCache(cacheKey, data)
  return data
}
