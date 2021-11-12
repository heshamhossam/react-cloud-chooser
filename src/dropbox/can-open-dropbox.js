import React, { useState } from 'react'
import { pipe, loadSDK, removeSpaces, split, andThen } from '../utils'

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

const Dropbox = (appKey) => ({
  flatMap: (fn) => loadDropboxSdk(appKey).then(fn)
})

export const openDropbox = ({ appKey, ...dropBoxOptions } = {}) =>
  new Promise((resolve) =>
    Dropbox(appKey).flatMap((dropbox) => {
      dropbox.choose({
        ...dropBoxOptions,
        extensions: buildExtensions(dropBoxOptions.extensions)
      })
      resolve()
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
          success,
          cancel,
          linkType,
          multiselect,
          extensions
        }),
      andThen(() => setIsDropboxLoading(false))
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
