import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
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
  const [submittingStatus, setSubmittingStatus] = useState(null)

  useEffect(() => {
    const fetchWorker = async () => {
      if (!id) return
      setLoading(true)
      try {
        const res = await api.get(`/workers/${id}`, { params: { companyId: currentCompany?.id } })
        setWorker(res.worker || res.data || res)
      } catch (err) {
        console.error('Failed to load worker:', err)
        const message = err?.message || err?.msg || err?.error || 'Failed to load worker'
        showError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchWorker()
  }, [id, currentCompany, showError])

  const handleMarkAttendance = async (status) => {
    if (!id || !currentCompany?.id) {
      showError('Please select a company first')
      return
    }

    setSubmittingStatus(status)
    try {
      await api.post(`/workers/${id}/attendance`, {
        companyId: currentCompany.id,
        status
      })
      showSuccess(`Marked ${status} successfully`)
    } catch (err) {
      console.error('Failed to mark attendance:', err)
      const message = err?.message || err?.msg || err?.error || 'Failed to mark attendance'
      showError(message)
    } finally {
      setSubmittingStatus(null)
    }
  }

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
        <div className="rounded border p-4">
          <div className="mb-2">Worker ID: {id}</div>
          <div className="mb-4">Name: {worker?.user?.name || worker?.name || '-'}</div>
          <div className="mb-4 text-sm text-muted-foreground">
            Use the buttons below to mark today&apos;s attendance.
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleMarkAttendance('present')} disabled={submittingStatus !== null}>
              {submittingStatus === 'present' ? 'Saving...' : 'Mark Present'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMarkAttendance('absent')}
              disabled={submittingStatus !== null}
            >
              {submittingStatus === 'absent' ? 'Saving...' : 'Mark Absent'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkerAttendance

