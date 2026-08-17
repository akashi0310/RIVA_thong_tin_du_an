import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useCskhStore = create((set, get) => ({
  messages: [],
  faqs: [],
  loading: false,
  fetchError: null,

  // --- Messages ---
  fetchMessages: async () => {
    set({ loading: true, fetchError: null })
    const { data, error } = await supabase.from('cskh_messages').select('*').order('created_at', { ascending: false })
    if (error) console.error('fetchMessages error:', error.message)
    set({ messages: data || [], loading: false, fetchError: error?.message || null })
  },

  addMessage: async (msg) => {
    const { data, error } = await supabase.from('cskh_messages').insert([msg]).select().single()
    if (!error && data) set(s => ({ messages: [data, ...s.messages] }))
    return { data, error }
  },

  updateMessage: async (id, updates) => {
    const { data, error } = await supabase.from('cskh_messages').update(updates).eq('id', id).select().single()
    if (!error && data) set(s => ({ messages: s.messages.map(m => m.id === id ? data : m) }))
    return { data, error }
  },

  deleteMessage: async (id) => {
    const { error } = await supabase.from('cskh_messages').delete().eq('id', id)
    if (!error) set(s => ({ messages: s.messages.filter(m => m.id !== id) }))
    return { error }
  },

  // --- FAQs ---
  fetchFaqs: async () => {
    const { data, error } = await supabase.from('cskh_faq').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
    if (error) console.error('fetchFaqs error:', error.message)
    set({ faqs: data || [] })
  },

  addFaq: async (faq) => {
    const { data, error } = await supabase.from('cskh_faq').insert([faq]).select().single()
    if (!error && data) set(s => ({ faqs: [...s.faqs, data] }))
    return { data, error }
  },

  updateFaq: async (id, updates) => {
    const { data, error } = await supabase.from('cskh_faq').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (!error && data) set(s => ({ faqs: s.faqs.map(f => f.id === id ? data : f) }))
    return { data, error }
  },

  deleteFaq: async (id) => {
    const { error } = await supabase.from('cskh_faq').delete().eq('id', id)
    if (!error) set(s => ({ faqs: s.faqs.filter(f => f.id !== id) }))
    return { error }
  },

  // Realtime subscription — wrapped in try/catch
  subscribeRealtime: () => {
    try {
      const channel = supabase.channel('cskh-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cskh_messages' }, () => get().fetchMessages())
        .subscribe()
      return () => supabase.removeChannel(channel)
    } catch (e) {
      console.error('CSKH realtime subscription failed:', e)
      return () => {}
    }
  },
}))
