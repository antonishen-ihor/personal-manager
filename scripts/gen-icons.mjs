// Генерує PNG-іконки для PWA з квадратного SVG (мотив логотипа на синьому).
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#4284e7"/>
  <rect x="126" y="126" width="130" height="130" fill="#ffffff"/>
  <rect x="256" y="256" width="130" height="130" fill="#ffffff"/>
</svg>`

const out = 'public/icons'
mkdirSync(out, { recursive: true })
const buf = Buffer.from(ICON)

await sharp(buf).resize(192, 192).png().toFile(`${out}/icon-192.png`)
await sharp(buf).resize(512, 512).png().toFile(`${out}/icon-512.png`)
await sharp(buf).resize(180, 180).png().toFile(`${out}/apple-touch-icon.png`)

console.log('Іконки згенеровано в', out)
