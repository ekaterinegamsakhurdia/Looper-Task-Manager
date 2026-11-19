import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchTasks, updateTaskStage } from '../lib/queries'

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchTasks(filters)
      setTasks(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    load()
    const channel = supabase.channel('tasks-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const moveTask = useCallback(async (id, stage) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, stage } : t))
    try { await updateTaskStage(id, stage) }
    catch { load() }
  }, [load])

  return { tasks, loading, error, reload: load, moveTask }
}
