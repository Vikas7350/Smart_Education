export interface User {
  id: string
  name: string
  email: string
  class: string
  role: string
  points: number
  streak: number
}

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const setStoredAuth = (token: string, user: User) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearStoredAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const isAuthenticated = (): boolean => {
  return !!getStoredToken()
}



