import loadScript from 'load-script'

export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, fn) => fn(v), x)

export const loadSDK =
  (isLoaded) =>
  ({ url, attrs = {} } = {}) =>
    !isLoaded() &&
    loadScript(url, {
      attrs: attrs
    })

export const selectFromProps =
  (props) =>
  (...keys) =>
    keys.reduce((options, key) => ({ ...options, [key]: props?.[key] }), {})

export const removeSpaces = (str) => str.replace(/\s/g, '')
export const split = (splitter) => (str) => str.split(splitter)

export const tap = fn => v => {
  fn(v);
  return v;
}
export const tapLog = tap(console.log);