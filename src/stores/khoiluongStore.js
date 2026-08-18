import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useKhoiLuongStore = create((set, get) => ({
  congViec: [],
  kpi: [],
  marketing: [],
  phanCong: [],
  loading: false,
  fetchError: null,

  fetchAll: async () => {
    set({ loading: true, fetchError: null })
    const [cv, kpiRes, mk, pc] = await Promise.all([
      supabase.from('kl_cong_viec').select('*').order('stt', { ascending: true }),
      supabase.from('kl_kpi').select('*').order('id', { ascending: true }),
      supabase.from('kl_marketing').select('*').order('stt', { ascending: true }),
      supabase.from('kl_phan_cong').select('*').order('id', { ascending: true }),
    ])
    if (cv.error) console.error('kl_cong_viec:', cv.error.message)
    if (kpiRes.error) console.error('kl_kpi:', kpiRes.error.message)
    if (mk.error) console.error('kl_marketing:', mk.error.message)
    if (pc.error) console.error('kl_phan_cong:', pc.error.message)
    set({
      congViec: cv.data || [],
      kpi: kpiRes.data || [],
      marketing: mk.data || [],
      phanCong: pc.data || [],
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

  addCongViec: async (task) => {
    const { congViec } = get()
    const maxStt = congViec.reduce((m, t) => Math.max(m, t.stt || 0), 0)
    const { data, error } = await supabase
      .from('kl_cong_viec')
      .insert([{ ...task, stt: maxStt + 1 }])
      .select()
      .single()
    if (!error && data)
      set(s => ({ congViec: [...s.congViec, data] }))
    return { data, error }
  },

  subscribeRealtime: () => {
    try {
      const channel = supabase.channel('khoiluong-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kl_cong_viec' }, () => get().fetchAll())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kl_kpi' }, () => get().fetchAll())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kl_marketing' }, () => get().fetchAll())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kl_phan_cong' }, () => get().fetchAll())
        .subscribe()
      return () => supabase.removeChannel(channel)
    } catch (e) {
      console.error('KhoiLuong realtime subscription failed:', e)
      return () => {}
    }
  },

  // Thống kê theo người thực hiện (col H)
  getPeopleStats: () => {
    const { congViec } = get()
    const people = {}
    for (const t of congViec) {
      const names = (t.thuc_hien || '').split(/[,/]/).map(s => s.trim()).filter(Boolean)
      for (const name of names) {
        if (!people[name]) people[name] = { name, total: 0, done: 0, pending: 0 }
        people[name].total++
        if (t.trang_thai === '✓') people[name].done++
        if (t.trang_thai === '⏳') people[name].pending++
      }
    }
    return Object.values(people).sort((a, b) => b.total - a.total)
  },
}))
