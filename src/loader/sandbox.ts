export class ProxySandbox {
  proxy: any
  running = false
  constructor() {
    // 创建一个假的window
    const fakeWindow = Object.create(null)
    const proxy = new Proxy(fakeWindow, {
      set: (target: any, p: string, value: any) => {
        // 如果当前沙箱在运行，就直接把值设置到fakeWindow上
        if (this.running) {
          target[p] = value
        }
        return true
      },
      get(target: any, p: string): any {
        // 防止用户逃课
        switch (p) {
          case 'window':
          case 'self':
          case 'globalThis':
            return proxy
        }
        // 假如属性不存在fakeWindow上，但是存在于window上
        // 从window上取值
        if (
          !window.hasOwnProperty.call(target, p) &&
          window.hasOwnProperty(p)
        ) {
          // @ts-ignore
          const value = window[p]
          if (typeof value === 'function') return value.bind(window)
          return value
        }
        return target[p]
      },
      has() {
        return true
      },
    })
    this.proxy = proxy
  }
  // 激活沙箱
  active() {
    this.running = true
  }
  // 失活沙箱
  inactive() {
    this.running = false
  }
}
