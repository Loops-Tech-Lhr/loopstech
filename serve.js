// Local static server for the built site. Usage: npm run build && node serve.js dist [port]
// Mirrors production: directory index files, real 404 page, no catch-all rewrite.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2] || 'dist')
const port = Number(process.argv[3] || process.env.PORT || 8080)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'text/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
}

const send = (res, status, file) => {
  res.writeHead(status, {
    'Content-Type': types[path.extname(file)] || 'application/octet-stream'
  })
  fs.createReadStream(file).pipe(res)
}

http
  .createServer((req, res) => {
    let urlPath
    try {
      urlPath = decodeURIComponent(req.url.split('?')[0])
    } catch {
      res.writeHead(400).end()
      return
    }
    const file = path.join(root, path.normalize(urlPath))
    // containment check that cannot be fooled by sibling directories such as dist-evil
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403).end()
      return
    }
    let target = file
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      if (!urlPath.endsWith('/')) {
        res.writeHead(301, { Location: urlPath + '/' }).end()
        return
      }
      target = path.join(target, 'index.html')
    }
    if (fs.existsSync(target) && fs.statSync(target).isFile())
      return send(res, 200, target)
    send(res, 404, path.join(root, '404.html'))
  })
  .listen(port, () =>
    console.log(`Loops Tech running at http://localhost:${port}`)
  )
