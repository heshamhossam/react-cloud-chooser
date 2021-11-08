React cloud chooser
============
react [Dropbox Chooser API](https://www.dropbox.com/developers/chooser), google drive, one drive file browse chooser

Installation 
============
```
npm install react-cloud-chooser
```

Usage
=====
```
import { canDropboxChoose } from 'react-cloud-chooser'

const connectDropboxChooser = canDropboxChoose({ appkey: '__app_key__' })

const DropboxBtn = connectDropboxChooser((props) => (
  <button onClick={props.dropboxChoose}>Dropbox</button>
))

<DropboxBtn
  multiselect={false}
  linkType='direct' // either direct or preview
  success={(files) => console.log(files)}
  cancel={() => console.log('cancel pressed')}
  extensions='.pdf,.jpg'
/>
```