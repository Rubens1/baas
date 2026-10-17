const SESSION_KEY = 'lerapay.session'

function isValidSession(value) {
  return Boolean(
    value?.accessToken &&
    value?.merchant?.id &&
    value?.expiresAt &&
    new Date(value.expiresAt).getTime() > Date.now(),
  )
}

export function getAuthSession() {
  for (const storage of [sessionStorage, localStorage]) {
    const value = storage.getItem(SESSION_KEY)
    if (!value) continue

    try {
      const session = JSON.parse(value)
      if (isValidSession(session)) return session
    } catch {
      storage.removeItem(SESSION_KEY)
    }

    storage.removeItem(SESSION_KEY)
  }

  return null
}

export function saveAuthSession(session, rememberMe) {
  clearAuthSession()
  const storage = rememberMe ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
}

export function getAccessToken() {
  return getAuthSession()?.accessToken ?? null
}
