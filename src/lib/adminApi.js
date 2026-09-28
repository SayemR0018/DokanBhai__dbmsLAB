import { getSupabase, setAdminEmail } from './supabaseClient'

const ADMIN_EMAIL = 'admin@dokanbhai.com'

async function callAdmin(fn) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase is not configured')
  setAdminEmail(ADMIN_EMAIL)
  const { data, error } = await supabase.rpc(fn)
  if (error) throw error
  return data
}

export const loadAdminOverview = () => callAdmin('admin_overview')
export const loadAdminShops = () => callAdmin('admin_shops')
export const loadAdminProducts = () => callAdmin('admin_products')
