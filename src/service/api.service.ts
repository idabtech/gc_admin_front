/// <reference types="vite/client" />
import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This enables sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
})

// Function to check if cookies are working and accessible
export const areCookiesEnabled = () => {
  try {
    // Try to read document.cookie - if cookies are disabled, this will be empty
    document.cookie = 'test_cookie=1; SameSite=Lax'
    const cookieEnabled = document.cookie.indexOf('test_cookie=1') !== -1
    // Clean up test cookie
    document.cookie = 'test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    return cookieEnabled
  } catch (e) {
    return false
  }
}

// Function to check if auth cookies exist
export const hasAuthCookie = () => {
  return document.cookie.indexOf('accessToken=') !== -1
}

// Function to debug cookie state
export const debugCookieState = () => {
  console.log('Cookie Debug:', {
    cookiesEnabled: areCookiesEnabled(),
    hasAuthCookie: hasAuthCookie(),
    allCookies: document.cookie,
    storedToken: getStoredToken()
  })
}

// Function to get auth token from localStorage as fallback
// Login flow stores as "token"; other flows may use "authToken"
export const getStoredToken = () => {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('authToken')
  )
}
// Request interceptor
api.interceptors.request.use(
  (config) => {

    const storedToken =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('authToken')

    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`
    } else {
      delete config.headers.Authorization
    }

    return config
  },
  err => {
    console.log('err********', err)
    if (err.response?.status === 401) {
      window.location.href = '/login'
    }

    return Promise.reject(err);
  })

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig

    const publicAuthEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/verify-email',
      '/auth/forgot-password',
    ]

    const isAuthApi = publicAuthEndpoints.some(endpoint =>
      originalRequest.url?.includes(endpoint)
    )

    // ✅ 401 from protected APIs → logout
    if (error.response?.status === 401 && !isAuthApi) {
      localStorage.clear();
      sessionStorage.clear();
      toast.error('Session expired. Please login again.')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)
