import Cookies from 'js-cookie'

// Define cookie options type
type CookieOptions = {
  expires?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

// Default cookie options
const defaultOptions: CookieOptions = {
  expires: 7, // 7 days
  path: '/',
  sameSite: 'strict'
}

// Global cookie store
export const cookieStore = {
  uId: '', // User ID cookie
}

// Function to set cookie both in js-cookie and our global store
export function setCookie(
  name: keyof typeof cookieStore,
  value: string,
  options: CookieOptions = {}
) {
  const mergedOptions = { ...defaultOptions, ...options }
  
  // Set in js-cookie
  Cookies.set(name, value, mergedOptions)
  
  // Set in global store
  cookieStore[name] = value
  
  // Set in document.cookie for immediate access
  document.cookie = `${name}=${value}; path=${mergedOptions.path}; max-age=${
    mergedOptions.expires ? mergedOptions.expires * 24 * 60 * 60 : undefined
  }; samesite=${mergedOptions.sameSite}`

  console.log(`Cookie '${name}' set:`, {
    value,
    options: mergedOptions,
    cookieStore,
    documentCookie: document.cookie
  })
}

// Function to get cookie from either store or js-cookie
export function getCookie(name: keyof typeof cookieStore): string | undefined {
  // First try global store
  if (cookieStore[name]) {
    return cookieStore[name]
  }
  
  // Fallback to js-cookie
  const cookieValue = Cookies.get(name)
  
  // Update global store if found
  if (cookieValue) {
    cookieStore[name] = cookieValue
  }
  
  console.log(`Cookie '${name}' get:`, {
    value: cookieValue,
    cookieStore,
    documentCookie: document.cookie
  })
  
  return cookieValue
}

// Function to remove cookie
export function removeCookie(name: keyof typeof cookieStore) {
  Cookies.remove(name, { path: '/' })
  cookieStore[name] = ''
  
  console.log(`Cookie '${name}' removed:`, {
    cookieStore,
    documentCookie: document.cookie
  })
}

// Initialize cookieStore from existing cookies
export function initializeCookieStore() {
  Object.keys(cookieStore).forEach((key) => {
    const typedKey = key as keyof typeof cookieStore
    const value = Cookies.get(typedKey)
    if (value) {
      cookieStore[typedKey] = value
    }
  })
  
  console.log('Cookie store initialized:', cookieStore)
}