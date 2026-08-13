import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useOnluyenStore = create((set) => ({
  students: [],
  loading: false,

  fetchStudents: async () => {
    set({ loading: true })
    const { data } = await supabase.from('onluyen_students').select('*').order('created_at', { ascending: false })
    set({ students: data || [], loading: false })
  },

  addStudent: async (student) => {
    const { data, error } = await supabase.from('onluyen_students').insert([student]).select().single()
    if (!error && data) set(s => ({ students: [data, ...s.students] }))
    return { data, error }
  },

  updateStudent: async (id, updates) => {
    const { data, error } = await supabase.from('onluyen_students').update(updates).eq('id', id).select().single()
    if (!error && data) set(s => ({ students: s.students.map(st => st.id === id ? data : st) }))
    return { data, error }
  },

  deleteStudent: async (id) => {
    const { error } = await supabase.from('onluyen_students').delete().eq('id', id)
    if (!error) set(s => ({ students: s.students.filter(st => st.id !== id) }))
    return { error }
  },
}))
