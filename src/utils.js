export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, fn) => fn(v), x)

const loadScript = ({ url, attrs = {} } = {}) => {
  const createScript = ({ url, onload } = {}) => {
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.onload = onload
    script.src = url
    return script
  }
  const addScriptAttrs =
    (attrs = {}) =>
    (script) => {
      Object.keys(attrs).forEach((k) => script.setAttribute(k, attrs[k]))
      return script
    }
  const appendToHead = (script) =>
    document.getElementsByTagName('head')[0].appendChild(script)
  const loader = pipe(
    (onload) => createScript({ url, onload }),
    addScriptAttrs(attrs),
    appendToHead
  )
  return new Promise((resolve) => loader(resolve))
}

export const tap = (fn) => (v) => {
  fn(v)
  return v
}
export const tapLog = tap(console.log)

export const loadSDK =
  (getSdk) =>
  ({ url, attrs = {} } = {}) =>
    new Promise((resolve) =>
      !!getSdk()
        ? resolve(getSdk())
        : loadScript({ url, attrs }).then(() => resolve(getSdk()))
    )

export const selectFromProps =
  (props) =>
  (...keys) =>
    keys.reduce((options, key) => ({ ...options, [key]: props?.[key] }), {})

export const removeSpaces = (str) => str.replace(/\s/g, '')
export const split = (splitter) => (str) => str.split(splitter)
export const andMethod = (method) => (fn) => (monad) => monad[method](fn)
export const andThen = andMethod('then')
export const andFlatMap = andMethod('flatMap')
