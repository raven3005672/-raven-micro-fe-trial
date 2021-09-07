import { match } from 'path-to-regexp'
import { getAppList } from './appList'
import { IInternalAppInfo } from './types'
import { AppStatus } from './enum'
import { importEntry } from 'import-html-entry'
import { getCache, setCache } from './cache'

export const getAppListStatus = () => {
  // 需要渲染的应用列表
  const actives: IInternalAppInfo[] = []
  // 需要卸载的应用列表
  const unmounts: IInternalAppInfo[] = []
  // 获取注册的子应用列表
  const list = getAppList() as IInternalAppInfo[]
  list.forEach((app) => {
    // 匹配路由
    const isActive = match(app.activeRule, { end: false })(location.pathname)
    // 判断应用状态
    switch (app.status) {
      case AppStatus.NOT_LOADED:
      case AppStatus.LOADING:
      case AppStatus.LOADED:
      case AppStatus.BOOTSTRAPPING:
      case AppStatus.NOT_MOUNTED:
        isActive && actives.push(app);
        break;
      case AppStatus.MOUNTED:
        !isActive && unmounts.push(app);
        break;
    }
  })

  return { actives, unmounts }
}

export const fetchResource = async (url: string, appName: string) => {
  if (getCache(appName, url)) return getCache(appName, url)
  const data = await fetch(url).then(async (res) => await res.text())
  setCache(appName, url, data)
  return data
}

export function getCompletionURL(src: string | null, baseURI: string) {
  if (!src) return src;
  // 如果 URL 已经是协议开头的就直接返回
  if (/^(https|http)/.test(src)) return src;
  // 通过原生方法拼接URL
  return new URL(src, getCompletionBaseURL(baseURI)).toString()
}
// 获取完整的 BaseURL
// 因为用户在注册应用的 entry 里面可能填入 //xxx 或者 https:// 这种格式的 URL
export function getCompletionBaseURL(url: string) {
  return url.startsWith('//') ? `${location.protocol}${url}` : url
}

export const prefetch = async (app: IInternalAppInfo) => {
  requestIdleCallback(async () => {
    const { getExternalScripts, getExternalStyleSheets } = await importEntry(
      app.entry
    )
    requestIdleCallback(getExternalStyleSheets)
    requestIdleCallback(getExternalScripts)
  })
}
