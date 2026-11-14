// Mock API. Jalankan: node server.mjs  (Node 20+)

import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

const PORT = process.env.PORT || 3001
const NOW = () => (process.env.MOCK_NOW ? new Date(process.env.MOCK_NOW) : new Date())
const seed = () => JSON.parse(readFileSync(new URL('./data.json', import.meta.url), 'utf8'))
let db = seed()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  })
  res.end(JSON.stringify(body))
}
const readBody = (req) =>
  new Promise((resolve) => {
    let raw = ''
    req.on('data', (c) => (raw += c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'))
      } catch {
        resolve(null)
      }
    })
  })

// Tanggal tanpa jam dianggap berlaku sampai akhir hari itu (WIB).
const expiry = (s) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T23:59:59.999+07:00`) : new Date(s)
const isExpired = (v) => expiry(v.expires_at) < NOW()

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (req.method === 'OPTIONS') return send(res, 204, {})

  await sleep(150 + Math.random() * 600)

  if (req.method === 'GET' && (url.pathname === '/api' || url.pathname === '/api/')) {
    return send(res, 200, {
      name: 'Mock API',
      endpoints: [
        'GET /api/cart',
        'PATCH /api/cart/items/:sku',
        'GET /api/vouchers',
        'POST /api/vouchers/validate',
        'POST /api/__reset',
      ],
    })
  }

  if (req.method === 'POST' && url.pathname === '/api/__reset') {
    db = seed()
    return send(res, 200, { ok: true })
  }

  if (req.method === 'GET' && url.pathname === '/api/cart') {
    return send(res, 200, db.cart)
  }

  const m = url.pathname.match(/^\/api\/cart\/items\/([\w-]+)$/)
  if (req.method === 'PATCH' && m) {
    const item = db.cart.items.find((i) => i.sku === m[1])
    if (!item) return send(res, 404, { message: 'Item tidak ditemukan' })
    const b = await readBody(req)
    const qty = Number(b?.qty)
    if (!Number.isInteger(qty) || qty < 0) return send(res, 400, { message: 'qty tidak valid' })
    const stock = item.stock ?? item.stok
    if (qty > stock) return send(res, 200, { error: 'INSUFFICIENT_STOCK', available: stock })
    if ('quantity' in item) item.quantity = qty
    else item.qty = qty
    return send(res, 200, item)
  }

  if (req.method === 'GET' && url.pathname === '/api/vouchers') {
    return send(res, 200, { data: db.vouchers })
  }

  if (req.method === 'POST' && url.pathname === '/api/vouchers/validate') {
    const b = await readBody(req)
    if (!b || typeof b.code !== 'string') return send(res, 400, { message: 'code wajib diisi' })
    const subtotal = Number(b.subtotal ?? 0)
    // Pencocokan kode PERSIS (peka huruf besar-kecil, tanpa trim).
    const matches = db.vouchers.filter((v) => v.code === b.code)
    if (!matches.length) return send(res, 200, { valid: false, reason: 'NOT_FOUND' })
    // Jika ada beberapa rekaman, pakai yang aktif dan belum kedaluwarsa.
    const usable = matches.find((v) => v.active && !isExpired(v)) ?? matches[0]
    if (!usable.active) return send(res, 200, { valid: false, reason: 'INACTIVE' })
    if (isExpired(usable))
      return send(res, 200, { valid: false, reason: 'EXPIRED', expires_at: usable.expires_at })
    if (subtotal < usable.min_spend) {
      return send(res, 200, { valid: false, reason: 'MIN_SPEND', min_spend: usable.min_spend })
    }
    return send(res, 200, { valid: true, voucher: usable })
  }

  send(res, 404, { message: 'Not found' })
}).listen(PORT, () => console.log(`Mock API di http://localhost:${PORT}/api`))
