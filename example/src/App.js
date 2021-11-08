import React from 'react'

import { canDropboxChoose } from 'react-cloud-chooser'

const connectDropboxChooser = canDropboxChoose({ appkey: '__app_key__' })

const DropboxBtn = connectDropboxChooser((props) => (
  <button onClick={props.dropboxChoose}>Dropbox</button>
))

const App = () => {
  return (
    <DropboxBtn
      multiselect={false}
      linkType='direct' // either direct or preview
      success={(files) => console.log(files)}
      cancel={() => console.log('cancel pressed')}
      extensions='.pdf,.jpg'
    />
  )
}

export default App
