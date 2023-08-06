import fs from "fs/promises"
import { createReadStream } from "fs"
import path from "path"
import crypto from 'crypto'

type Dir = {
  path: string,
  relativePath: string,
  files: [name: string, md5: string][],
  dirs: string[],
}

export async function ls(dirPath: string): Promise<Dir> {
  const absPath = path.resolve(dirPath)
  const subFiles = await fs.readdir(dirPath, { withFileTypes: true })
  const files: [name: string, md5: string][] = []
  const dirs: string[] = []
  await Promise.all(subFiles.filter(file => !file.name.startsWith('.'))
    .map(async file => {
      const filePath = path.resolve(absPath, file.name)
      if (file.isDirectory()) {
        dirs.push(file.name)
      } else if (file.isFile()) {
        const md5Res = await md5(filePath)
        if (md5Res instanceof Error) {
          console.error(`read ${ filePath } md5 failed! skipped`)
          console.error(md5Res)
        } else {
          files.push([file.name, md5Res])
        }
      } else {
        console.info(`${ filePath } is neither directory nor file, skipped`)
      }
    }))
  return {
    path: absPath, relativePath: path.relative(process.cwd(), absPath), files, dirs
  }
}



export async function lsRec(dirPath: string): Promise<Omit<Dir, 'dirs'> & {dirs: Dir[]}> {
  const res = await ls(dirPath)
  return {...res, dirs: await Promise.all(res.dirs.map(subdir => ls(path.resolve(res.path, subdir))))}
}

async function md5(filePath: string): Promise<string | Error> {
  const hash = crypto.createHash('md5');
  const input = createReadStream(filePath);
  return new Promise(resolve => {
    input.on('error', err => {
      resolve(err);
    });

    input.on('data', chunk => {
      hash.update(chunk);
    });

    input.on('end', () => {
      const md5 = hash.digest('hex');
      resolve(md5)
    });
  })
}