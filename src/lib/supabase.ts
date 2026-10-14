import 'react-native-url-polyfill/auto'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

import { supabaseKey, supabaseUrl } from '@/src/lib/env'

/**
 * AsyncStorage touches window. Skip it while Expo is rendering on the server.
 */
const authStorage = {
  /**
   * Reads a session value. Returns null during static rendering.
   * @param key Storage key.
   */
  getItem: (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return Promise.resolve(null)
    return AsyncStorage.getItem(key)
  },
  /**
   * Writes a session value. No-ops during static rendering.
   * @param key Storage key.
   * @param value Stored string.
   */
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve()
    return AsyncStorage.setItem(key, value)
  },
  /**
   * Removes a session value. No-ops during static rendering.
   * @param key Storage key.
   */
  removeItem: (key: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve()
    return AsyncStorage.removeItem(key)
  },
}

/**
 * Shared Supabase client. Session lives in AsyncStorage on device.
 */
export const supabase = createClient(supabaseUrl(), supabaseKey(), {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
