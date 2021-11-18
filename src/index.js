// Dropbox
import { createOpenDropbox } from './dropbox/can-open-dropbox'
export const openDropbox = createOpenDropbox()
export { canOpenDropbox } from './dropbox/can-open-dropbox'

// Google Drive
import {
  createAuthorize,
  createOpenPicker
} from './google-drive/can-open-google-drive'
export { canOpenGoogleDrive } from './google-drive/can-open-google-drive'
export const getAccessToken = createAuthorize()
export const openPicker = createOpenPicker()
