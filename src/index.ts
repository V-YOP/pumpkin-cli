import path from 'path'
import {lsRec} from './util'


lsRec('/Users/yuuki/code/pumpkin/upload_albums').then(JSON.stringify).then(console.log).then(_ => console.timeEnd())