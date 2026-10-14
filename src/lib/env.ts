/**
 * Reads a required public Expo env value.
 * @param name Env var name, including the EXPO_PUBLIC_ prefix.
 */
const readEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`)
  }
  return value
}

/** Supabase project URL from the public env. */
export const supabaseUrl = (): string => readEnv('EXPO_PUBLIC_SUPABASE_URL')

/** Publishable client key. Never put the database password here. */
export const supabaseKey = (): string => readEnv('EXPO_PUBLIC_SUPABASE_KEY')
