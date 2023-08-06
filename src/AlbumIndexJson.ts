import { z } from "zod"

export const AlbumIndexJson = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Book'),
    name: z.string(),
    description: z.string().optional(),
    direction: z.literal('ltr').or(z.literal('rtl'))
  }),
  z.object({
    type: z.literal('Image Set'),
    name: z.string(),
    description: z.string().optional(),
  })
])
export type AlbumIndexJson = z.infer<typeof AlbumIndexJson>