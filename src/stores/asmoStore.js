import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAsmoStore = create((set, get) => ({
  incidents: [],
  tasks: [],
  loading: false,
  fetchError: null,

  // --- Incidents ---
  fetchIncidents: async () => {
    set({ loading: true, fetchError: null })
    const { data, error } = await supabase.from('incidents').select('*').order('created_at', { ascending: false })
    if (error) console.error('fetchIncidents error:', error.message)
    set({ incidents: data || [], loading: false, fetchError: error?.message || null })
  },

  addIncident: async (incident) => {
    const { data, error } = await supabase.from('incidents').insert([incident]).select().single()
    if (!error && data) set(s => ({ incidents: [data, ...s.incidents] }))
    return { data, error }
  },

  updateIncident: async (id, updates) => {
    const { data, error } = await supabase.from('incidents').update(updates).eq('id', id).select().single()
    if (!error && data) set(s => ({ incidents: s.incidents.map(i => i.id === id ? data : i) }))
    return { data, error }
  },

  deleteIncident: async (id) => {
    const { error } = await supabase.from('incidents').delete().eq('id', id)
    if (!error) set(s => ({ incidents: s.incidents.filter(i => i.id !== id) }))
    return { error }
  },

  // --- Tasks ---
  fetchTasks: async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('stt', { ascending: true })
    if (error) console.error('fetchTasks error:', error.message)
    set({ tasks: data || [] })
  },

  addTask: async (task) => {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single()
    if (!error && data) set(s => ({ tasks: [...s.tasks, data] }))
    return { data, error }
  },

  updateTask: async (id, updates) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (!error && data) set(s => ({ tasks: s.tasks.map(t => t.id === id ? data : t) }))
    return { data, error }
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
    return { error }
  },

  // Realtime subscription — wrapped in try/catch
  subscribeRealtime: () => {
    try {
      const channel = supabase.channel('asmo-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => get().fetchIncidents())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => get().fetchTasks())
        .subscribe()
      return () => supabase.removeChannel(channel)
    } catch (e) {
      console.error('Realtime subscription failed:', e)
      return () => {}
    }
  },
}))
