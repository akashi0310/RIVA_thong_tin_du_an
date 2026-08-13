import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useNckhStore = create((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    const { data } = await supabase.from('nckh_projects').select('*').order('created_at', { ascending: false })
    set({ projects: data || [], loading: false })
  },

  addProject: async (project) => {
    const { data, error } = await supabase.from('nckh_projects').insert([project]).select().single()
    if (!error && data) set(s => ({ projects: [data, ...s.projects] }))
    return { data, error }
  },

  updateProject: async (id, updates) => {
    const { data, error } = await supabase.from('nckh_projects').update(updates).eq('id', id).select().single()
    if (!error && data) set(s => ({ projects: s.projects.map(p => p.id === id ? data : p) }))
    return { data, error }
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('nckh_projects').delete().eq('id', id)
    if (!error) set(s => ({ projects: s.projects.filter(p => p.id !== id) }))
    return { error }
  },
}))
