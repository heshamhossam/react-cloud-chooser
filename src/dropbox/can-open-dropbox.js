import React, { useCallback } from 'react'
import { pipe, loadSDK, removeSpaces, split } from '../utils'

const extensionsToArray = pipe(removeSpaces, split(','))

const buildExtensions = (extensions) =>
  typeof extensions === 'string' ? extensionsToArray(extensions) : extensions

const prepareDropboxProps = (props) => {
  const { success, cancel, linkType, multiselect, extensions } = props
  return {
    success,
    cancel,
    linkType,
    multiselect,
    extensions: buildExtensions(extensions)
  }
}

const openDropbox = pipe(prepareDropboxProps, (options) =>
  window.Dropbox?.choose(options)
)

const memoCallback = (fn) => useCallback(fn, [])

export const canOpenDropbox = ({ appkey = '' } = {}) => {
  loadSDK(() => !!window.Dropbox)({
    url: 'https://www.dropbox.com/static/api/2/dropins.js',
    attrs: {
      id: 'dropboxjs',
      'data-app-key': appkey
    }
  })
  return (Component) => {
    return (props) => {
      const _openDropbox = memoCallback(() => openDropbox(props))
      return <Component {...props} openDropbox={_openDropbox} />
    }
  }
}
