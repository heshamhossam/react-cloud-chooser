export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, fn) => fn(v), x)

export const createInsertScriptTag =
  ({
    createElement = (tagName) => document.createElement(tagName),
    getElementsByTagName = (tagName) => document.getElementsByTagName(tagName)
  } = {}) =>
  ({ url, attrs = {} } = {}) => {
    const createScript = ({ url, onload } = {}) => {
      let script = createElement('script')
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
      getElementsByTagName('head')[0].appendChild(script)
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

export const selectFromProps =
  (props) =>
  (...keys) =>
    keys.reduce((options, key) => ({ ...options, [key]: props?.[key] }), {})

export const removeSpaces = (str) => str.replace(/\s/g, '')
export const split = (splitter) => (str) => str.split(splitter)
export const andMethod = (method) => (fn) => (monad) => monad[method](fn)
export const andThen = andMethod('then')
export const andFinally = andMethod('finally')
export const andCatch = andMethod('catch')

export const ifElse = (validator, onTrue, onFalse) =>
  validator() ? onTrue() : onFalse && onFalse()

export const withCachedPromiserRunner =
  ({ run } = {}) =>
  (o = {}) => {
    let _cachedPromise = null
    return {
      ...o,
      run: function () {
        return pipe(
          () =>
            ifElse(
              () => !_cachedPromise,
              () => (_cachedPromise = run.apply(this, arguments))
            ),
          () => _cachedPromise
        )()
      }
    }
  }
