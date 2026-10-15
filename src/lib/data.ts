import { parseCheckin, parseRoutine, parseTip } from '@/src/lib/guards'
import { supabase } from '@/src/lib/supabase'
import type { AnalysisResult, Checkin, Tip, YogaRoutine } from '@/src/types/models'

const checkinColumns =
  'id, user_id, captured_at, storage_path, redness, under_eye, texture, uneven_tone, blemishes, quality, findings, summary'

const routineSelect =
  'id, slug, title, zone, minutes, summary, level, video_url, yoga_steps(id, step_order, title, instruction, seconds, animation_key)'

/**
 * Turns a base64 JPEG (optional data URL) into bytes.
 * @param value Base64 payload from the image manipulator.
 */
export const decodeBase64 = (value: string): Uint8Array => {
  const clean = value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
  const binary = globalThis.atob(clean)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

/**
 * Loads the signed-in user's check-ins, newest first.
 */
export const fetchCheckins = async (): Promise<Checkin[]> => {
  const { data, error } = await supabase
    .from('checkins')
    .select(checkinColumns)
    .order('captured_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? [])
    .map((row) => parseCheckin(row))
    .filter((row): row is Checkin => row !== null)
}

/**
 * Creates a one-hour signed URL for a private selfie.
 * @param path Object path inside the selfies bucket.
 */
export const signedSelfieUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage.from('selfies').createSignedUrl(path, 60 * 60)
  if (error || !data?.signedUrl) throw new Error(error?.message ?? 'Could not open photo')
  return data.signedUrl
}

/**
 * Uploads a JPEG and stores the analysis on the user's account.
 * @param userId Signed-in user id. Used as the storage folder.
 * @param base64 JPEG base64 from the resized capture.
 * @param analysis Scores already computed on device.
 */
export const saveCheckin = async (
  userId: string,
  base64: string,
  analysis: AnalysisResult,
): Promise<Checkin> => {
  const bytes = decodeBase64(base64)
  const id = globalThis.crypto.randomUUID()
  const storagePath = `${userId}/${id}.jpg`
  const { error: uploadError } = await supabase.storage.from('selfies').upload(storagePath, bytes, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (uploadError) throw new Error(uploadError.message)
  const { data, error } = await supabase
    .from('checkins')
    .insert({
      id,
      user_id: userId,
      storage_path: storagePath,
      redness: analysis.redness,
      under_eye: analysis.underEye,
      texture: analysis.texture,
      uneven_tone: analysis.unevenTone,
      blemishes: analysis.blemishes,
      quality: analysis.quality,
      findings: analysis.findings,
      summary: analysis.summary,
    })
    .select(checkinColumns)
    .single()
  if (error) throw new Error(error.message)
  const checkin = parseCheckin(data)
  if (!checkin) throw new Error('Saved check-in could not be read back')
  return checkin
}

/**
 * Loads published face-yoga routines with steps.
 */
export const fetchRoutines = async (): Promise<YogaRoutine[]> => {
  const { data, error } = await supabase
    .from('yoga_routines')
    .select(routineSelect)
    .eq('published', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? [])
    .map((row) => parseRoutine(row))
    .filter((row): row is YogaRoutine => row !== null)
}

/**
 * Loads one routine by slug.
 * @param slug Public routine slug.
 */
export const fetchRoutine = async (slug: string): Promise<YogaRoutine | null> => {
  const { data, error } = await supabase
    .from('yoga_routines')
    .select(routineSelect)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return parseRoutine(data)
}

/**
 * Records that the user finished a routine.
 * @param userId Signed-in user.
 * @param routineId Routine primary key.
 */
export const completeRoutine = async (userId: string, routineId: string): Promise<void> => {
  const { error } = await supabase.from('yoga_sessions').insert({
    user_id: userId,
    routine_id: routineId,
  })
  if (error) throw new Error(error.message)
}

/**
 * Loads youth-care tips in display order.
 */
export const fetchTips = async (): Promise<Tip[]> => {
  const { data, error } = await supabase
    .from('tips')
    .select('id, category, title, body')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => parseTip(row)).filter((row): row is Tip => row !== null)
}

/**
 * Deletes photos, check-ins, yoga history, and consent for the current user.
 */
export const deleteMyData = async (): Promise<void> => {
  const { error } = await supabase.rpc('delete_my_facepal_data')
  if (error) throw new Error(error.message)
}
