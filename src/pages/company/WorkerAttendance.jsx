import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Button } from '../../components/ui/button'

const WorkerAttendance = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { currentCompany } = useAuth()
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchWorker = async () => {
      if (!id) return
      setLoading(true)
      try {
        const res = await api.get(`/workers/${id}`, { params: { companyId: currentCompany?.id } })
        setWorker(res.worker || res.data || res)
      } catch (err) {
        console.error('Failed to load worker:', err)
        const message = err?.message || err?.msg || err?.error || (err?.response && err.response.message) || 'Failed to load worker'
        showError(message)
      } finally {
        setLoading(false)
      }
    }
    fetchWorker()
  }, [id, currentCompany])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Attendance</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="p-4 border rounded">
          <div className="mb-2">Worker ID: {id}</div>
          <div className="mb-4">Name: {worker?.user?.name || worker?.name || '—'}</div>
          <div className="mb-4 text-sm text-muted-foreground">Attendance actions will be available here.</div>
          <div className="flex gap-2">
            <Button onClick={() => showSuccess('Mark Present — not implemented yet')}>Mark Present</Button>
            <Button onClick={() => showSuccess('Mark Absent — not implemented yet')}>Mark Absent</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkerAttendance
