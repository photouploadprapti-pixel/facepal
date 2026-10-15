/**
 * Reads the public Supabase project URL. The name must be written out so Expo
 * can inline it into the web bundle.
 */
export const supabaseUrl = (): string => {
  const value = process.env.EXPO_PUBLIC_SUPABASE_URL
  if (!value) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL. Copy .env.example to .env.')
  }
  return value
}

/**
 * Reads the publishable client key. Never put the database password here.
 */
export const supabaseKey = (): string => {
  const value = process.env.EXPO_PUBLIC_SUPABASE_KEY
  if (!value) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_KEY. Copy .env.example to .env.')
  }
  return value
}
