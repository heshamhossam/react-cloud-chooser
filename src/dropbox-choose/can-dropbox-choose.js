import React, { useCallback } from 'react'
import loadScript from 'load-script'

import { pipe } from '../utils'

const buildExtensions = (props) => ({
  ...props,
  extensions:
    typeof props.extensions === 'string'
      ? props.extensions.replace(/\s/g, '').split(',')
      : props.extensions
})
const loadSDK = (appkey) =>
  loadScript('https://www.dropbox.com/static/api/2/dropins.js', {
    attrs: {
      id: 'dropboxjs',
      'data-app-key': appkey
    }
  })

const ifNoSDK = (callback) => !window.Dropbox && callback()

const getChooseOptions = (props) =>
  ['success', 'cancel', 'linkType', 'multiselect', 'extensions'].reduce(
    (options, key) => ({ ...options, [key]: props?.[key] }),
    {}
  )
const memoCallback = (fn) => useCallback(fn, [])

export const canDropboxChoose = ({ appkey = '' } = {}) => {
  ifNoSDK(() => loadSDK(appkey))
  return (Component) => {
    return (props) => {
      const dropboxChoose = memoCallback(
        pipe(
          () => getChooseOptions(props),
          buildExtensions,
          (options) => window.Dropbox?.choose(options)
        )
      )
      return <Component {...props} dropboxChoose={dropboxChoose} />
    }
  }
}
