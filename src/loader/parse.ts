import { getCompletionURL } from '../utils'
import { IInternalAppInfo } from '../types'

const scripts: string[] = []
const links: string[] = []
const inlineScript: string[] = []

export const parseHTML = (parent: HTMLElement, app: IInternalAppInfo) => {
  const children = Array.from(parent.children) as HTMLElement[]
  children.length && children.forEach((item) => parseHTML(item, app))

  for (const dom of children) {
    if (/^(link)$/i.test(dom.tagName)) {
      // 处理link
      const data = parseLink(dom, parent, app)
      data && links.push(data)
    } else if (/^(script)$/i.test(dom.tagName)) {
      // 处理script
      const data = parseScript(dom, parent, app)
      data.text && inlineScript.push(data.text)
      data.url && scripts.push(data.url)
    } else if (/^(img)$/i.test(dom.tagName) && dom.hasAttribute('src')) {
      // 处理图片，毕竟图片资源用想对路径肯定也 404 了
      dom.setAttribute(
        'src',
        getCompletionURL(dom.getAttribute('src')!, app.entry)!
      )
    }
  }

  return { scripts, links, inlineScript }
}

const parseScript = (
  script: HTMLElement,
  parent: HTMLElement,
  app: IInternalAppInfo
) => {
  let comment: Comment | null
  const src = script.getAttribute('src');
  // 有src说明是JS文件，没src说明是inline script，也就是JS代码直接写标签里了
  if (src) {
    comment = document.createComment('script replaced by micro')
  } else if (script.innerHTML) {
    comment = document.createComment('inline script replaced by micro')
  }
  // @ts-ignore
  comment && parent.replaceChild(comment, script)
  return { url: getCompletionURL(src, app.entry), text: script.innerHTML }
}

const parseLink = (
  link: HTMLElement,
  parent: HTMLElement,
  app: IInternalAppInfo
) => {
  const rel = link.getAttribute('rel')
  const href = link.getAttribute('href')
  let comment: Comment | null;
  // 判断是不是获取 CSS 资源
  if (rel === 'stylesheet' && href) {
    comment = document.createComment(`link replaced by micro`)
    // @ts-ignore
    comment && parent.replaceChild(comment, script)
    return getCompletionURL(href, app.entry)
  } else if (href) {
    link.setAttribute('href', getCompletionURL(href, app.entry)!)
  }
}
