import { useState, useEffect } from 'react'
import { fetchEmployees } from '../lib/queries'

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetchEmployees()
      .then(data => { setEmployees(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const byId = id => employees.find(e => e.id === id)

  return { employees, loading, byId }
}

export default useEmployees
