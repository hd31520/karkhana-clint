const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const COMPANY_KEY = 'currentCompany'
const REMEMBER_KEY = 'rememberSession'

const safeParse = (value) => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const getTokenStore = () => {
  const remember = localStorage.getItem(REMEMBER_KEY) === 'true'
  return remember ? localStorage : sessionStorage
}

export const authStorage = {
  getRememberMe() {
    return localStorage.getItem(REMEMBER_KEY) === 'true'
  },
  setRememberMe(remember) {
    localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false')
  },
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
  },
  setToken(token, { remember = false } = {}) {
    this.setRememberMe(remember)
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)

    if (!token) {
      return
    }

    getTokenStore().setItem(TOKEN_KEY, token)
  },
  getUser() {
    return safeParse(localStorage.getItem(USER_KEY))
  },
  setUser(user) {
    if (!user) {
      localStorage.removeItem(USER_KEY)
      return
    }

    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  getCompany() {
    return safeParse(localStorage.getItem(COMPANY_KEY))
  },
  setCompany(company) {
    if (!company) {
      localStorage.removeItem(COMPANY_KEY)
      return
    }

    localStorage.setItem(COMPANY_KEY, JSON.stringify(company))
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(COMPANY_KEY)
    localStorage.removeItem(REMEMBER_KEY)
  },
}

export default authStorage
