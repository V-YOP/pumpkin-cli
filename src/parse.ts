import z from 'zod'
import path from 'path'
import type { Stats } from 'fs'
import fs from 'fs/promises'

/**
 * 传入一个目录，获取该目录下所有相册的元信息（包含所有图片的路径，md5），保存在该目录
 * 
 * 该目录下的每一个目录会作为一个相册，相册有两种类型——书籍类型和图集类型，分别对应不同的组织方式
 * 
 * 每一个相册的根目录需要有一个index.json，内容为下面定义的DefMeta类型。相册以及相册的每个子目录下可以有零个或多个图像和子目录
 * 
 */

/**
 * 书籍/漫画类型，假定所有图片为相同比例，使用grid布局去展示，同时允许使用类似slideshow的方式按序查看
 */
// const BookDefMeta = z.strictObject({
//   type: z.literal('Book'),
//   name: z.string(),
//   description: z.string().optional(),
//   direction: z.literal('ltr').or(z.literal('rtl'))
//   // TODO 子章节的排序咋解决？
// })

// /**
//  * 图集类型，假定图片尺寸不一致，使用瀑布流
//  */
// const ImageSetDefMeta = z.strictObject({
//   type: z.literal('ImageSet'),
//   name: z.string(),
//   description: z.string().optional(),
// })

// /**
//  * 各相册根目录下index.json的定义
//  */
// const DefMeta = z.union([BookDefMeta, ImageSetDefMeta])

// const ImageMeta = z.object({
//   name: z.string(),
//   description: z.string()
// })

// const PathMetaBase = z.strictObject({
//   images: z.array(z.object({md5: z.string(), size: z.number(), meta: ImageMeta}))
// })
// type PathMeta = z.infer<typeof PathMetaBase> & {
//   subdirs: PathMeta[]
// }
// const PathMeta: z.ZodType<PathMeta> = PathMetaBase.extend({
//   subdirs: z.lazy(() => PathMeta.array())
// })

// /**
//  * 某个相册的meta，
//  */
// const AlbumMeta = z.strictObject({
//   meta: DefMeta,
//   imgs: PathMeta
// })

// const GalleryMeta = z.strictObject({
//   name: z.string(),
//   description: z.string().optional(),

// })

// type AlbumMeta = z.infer<typeof AlbumMeta>



async function readGallery(galleryPath: string): Promise<void> {
  const absPath = path.resolve(process.cwd(), galleryPath)
  console.log(`reading gallery directory: ${absPath}`)
  process.chdir(absPath)
  const files = await ls(absPath)
  if (files.dirs.length === 0) {
    console.warn(`gallery directory '${absPath}' doesn't have any sub directories, nothing to do.`)
    return
  }
  // TODO read index.json
  // read every album directory
}



async function readAlbum(albumPath: string): Promise<AlbumMeta> {
  console.log(`reading album directory: ${albumPath}`)
  const dirName = path.basename(albumPath)
  const lst = await ls(albumPath)
  const jsonPath = path.resolve(albumPath, 'index.json')
  const meta: AlbumMeta = await (lst.files.indexOf('index.json') < 0 ? (async () => {
    console.info(`${jsonPath} missing, use directory name '${dirName}' as album name`)
    return {
      type: 'Image Set',
      name: dirName,
      description: ''
    }
  })() : (async () => {
    try {
      return await AlbumMeta.parseAsync(JSON.parse(await fs.readFile(jsonPath).then(x=>x.toString())))
    } catch (e) {
      console.error(`parse ${jsonPath} failed.`, e)
      throw e
    }
  })())
  console.log(meta)
  return meta
}

readAlbum('public').catch(console.log)

