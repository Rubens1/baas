import { getAccessToken } from './auth'

const baseUrl = import.meta.env.VITE_API_URL ?? ''

async function request(url, options = {}, { token, authenticated = true } = {}) {
  const headers = new Headers(options.headers)
  const accessToken = authenticated ? (token ?? getAccessToken()) : null
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(url, { ...options, headers })
  const responseText = await response.text()
  let data = null

  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      if (response.ok) {
        throw new Error('O servidor retornou uma resposta inválida.')
      }
    }
  }

  if (!response.ok) {
    if (authenticated && response.status === 401) {
      window.dispatchEvent(new Event('lerapay:session-expired'))
    }
    const message = Array.isArray(data?.message)
      ? data.message.join(' ')
      : data?.message
    throw new Error(message || `Falha na requisição (${response.status} ${response.statusText})`)
  }

  return { data }
}

async function post(path, body, { token, authenticated = true } = {}) {
  const url = new URL(`${baseUrl}${path}`, window.location.origin)
  return request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, { token, authenticated })
}

async function put(path, body, { token, authenticated = true } = {}) {
  const url = new URL(`${baseUrl}${path}`, window.location.origin)
  return request(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, { token, authenticated })
}

async function get(path, { params = {}, token, authenticated = true } = {}) {
  const query = new URLSearchParams();
  const url = new URL(`${baseUrl}${path}?${query.toString()}`, window.location.origin)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  }
  return request(url,
     {}, 
     { token, authenticated })
}

export const api = {
  async get(path, { params = {} } = {}) {
    const query = new URLSearchParams()

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value))
      }
    }

    const url = new URL(`${baseUrl}${path}`, window.location.origin)
    url.search = query.toString()

    return request(url, { cache: 'no-store' })
  },

  post,

  async login(credentials) {
    return post('/auth/login', credentials, { authenticated: false })
  },
}