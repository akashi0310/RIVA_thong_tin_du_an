import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useKhoiLuongStore = create((set, get) => ({
  congViec: [],
  kpi: [],
  marketing: [],
  loading: false,
  fetchError: null,

  fetchAll: async () => {
    set({ loading: true, fetchError: null })
    const [cv, kpiRes, mk] = await Promise.all([
      supabase.from('kl_cong_viec').select('*').order('stt', { ascending: true }),
      supabase.from('kl_kpi').select('*').order('id', { ascending: true }),
      supabase.from('kl_marketing').select('*').order('stt', { ascending: true }),
    ])
    if (cv.error) console.error('kl_cong_viec:', cv.error.message)
    if (kpiRes.error) console.error('kl_kpi:', kpiRes.error.message)
    if (mk.error) console.error('kl_marketing:', mk.error.message)
    set({
      congViec: cv.data || [],
      kpi: kpiRes.data || [],
      marketing: mk.data || [],
      loading: false,
      fetchError: cv.error?.message || null,
    })
  },

  updateCongViec: async (id, updates) => {
    const { data, error } = await supabase
      .from('kl_cong_viec')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data)
      set(s => ({ congViec: s.congViec.map(t => t.id === id ? data : t) }))
    return { data, error }
  },

  updateKPI: async (id, updates) => {
    const { data, error } = await supabase
      .from('kl_kpi')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data)
      set(s => ({ kpi: s.kpi.map(k => k.id === id ? data : k) }))
    return { data, error }
  },

  updateMarketing: async (id, updates) => {
    const { data, error } = await supabase
      .from('kl_marketing')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data)
      set(s => ({ marketing: s.marketing.map(m => m.id === id ? data : m) }))
    return { data, error }
  },

  // Thống kê theo người thực hiện (col H)
  getPeopleStats: () => {
    const { congViec } = get()
    const people = {}
    for (const t of congViec) {
      const names = (t.thuc_hien || '').split(/[,/]/).map(s => s.trim()).filter(Boolean)
      for (const name of names) {
        if (!people[name]) people[name] = { name, total: 0, done: 0 }
        people[name].total++
        if (t.trang_thai === '✓') people[name].done++
      }
    }
    return Object.values(people).sort((a, b) => b.total - a.total)
  },
}))
