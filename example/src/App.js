import React from 'react'

import { canOpenDropbox } from 'react-cloud-chooser'

const DtopboxBtn = (props) => (
  <button onClick={props.openDropbox}>Dropbox</button>
)

const connectOpenDropbox = canOpenDropbox({ appkey: '__app_key__' })
const DropboxOpenBtn = connectOpenDropbox(DtopboxBtn)

const App = () => {
  return (
    <DropboxOpenBtn
      multiselect={false}
      linkType='direct' // either direct or preview
      success={(files) => console.log(files)}
      cancel={() => console.log('cancel pressed')}
      extensions='.pdf,.jpg'
    />
  )
}

export default App
