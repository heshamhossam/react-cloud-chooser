import React, { useState } from 'react'
import { pipe, loadSDK, removeSpaces, split } from '../utils'

const extensionsToArray = pipe(removeSpaces, split(','))

const buildExtensions = (extensions) =>
  typeof extensions === 'string' ? extensionsToArray(extensions) : extensions

const loadDropboxSdk = (appKey) =>
  loadSDK(() => window.Dropbox)({
    url: 'https://www.dropbox.com/static/api/2/dropins.js',
    attrs: {
      id: 'dropboxjs',
      'data-app-key': appKey
    }
  })

export const openDropbox = ({ appKey, ...dropBoxOptions } = {}) =>
  new Promise((resolve, reject) =>
    loadDropboxSdk(appKey).then((dropbox) => {
      dropbox.choose({
        ...dropBoxOptions,
        success: resolve,
        cancel: reject,
        extensions: buildExtensions(dropBoxOptions.extensions)
      })
    })
  )

export const canOpenDropbox = (Component) => {
  return (props) => {
    const { appKey, success, cancel, linkType, multiselect, extensions } = props

    const [isDropboxLoading, setIsDropboxLoading] = useState()

    const _openDropbox = pipe(
      () => setIsDropboxLoading(true),
      () =>
        openDropbox({
          appKey,
          linkType,
          multiselect,
          extensions
        }),
      (openPromise) =>
        openPromise
          .then(success)
          .catch(cancel)
          .finally(() => setIsDropboxLoading(false))
    )
    return (
      <Component
        {...props}
        openDropbox={_openDropbox}
        isDropboxLoading={isDropboxLoading}
      />
    )
  }
}
