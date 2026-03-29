import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Calendar, Download, Users, UserCheck, UserX } from 'lucide-react'

const AttendanceOverview = () => {
  const { currentCompany } = useAuth()
  const [period, setPeriod] = useState('monthly') // monthly | yearly | all
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const companyId = currentCompany?.id || currentCompany?._id

  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ['attendance-summary', companyId, period, month, year],
    queryFn: async () => {
      if (!companyId) return null
      const params = { companyId, period }
      if (period === 'monthly') {
        params.month = month
        params.year = year
      }
      if (period === 'yearly') {
        params.year = year
      }
      // backend hook: implement /workers/attendance/summary accordingly
      return api.get('/workers/attendance/summary', { params })
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  })

  const summary = summaryRes?.summary || {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    records: [],
  }

  const attendanceRate = useMemo(() => {
    if (!summary.total) return 0
    return Math.round(((summary.present || 0) / summary.total) * 100)
  }, [summary])

  const records = summary.records || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Monitor worker attendance by month, year, or all-time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select a period to view attendance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Tabs value={period} onValueChange={setPeriod} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-1 gap-2">
              <Input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                disabled={period !== 'monthly'}
                className="w-full"
                placeholder="MM"
              />
              <Input
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full"
                placeholder="YYYY"
              />
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.present || 0}</div>
            <p className="text-xs text-muted-foreground">Total present days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.absent || 0}</div>
            <p className="text-xs text-muted-foreground">Total absences</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total || 0}</div>
            <p className="text-xs text-muted-foreground">Attendance entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Badge variant="outline">{attendanceRate}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Present / Total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Per-worker attendance for the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading attendance...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No attendance data for this period.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((rec) => (
                  <TableRow key={rec.workerId || rec.id}>
                    <TableCell className="font-medium">{rec.name || rec.workerName || rec.workerId}</TableCell>
                    <TableCell>{rec.present || 0}</TableCell>
                    <TableCell>{rec.absent || 0}</TableCell>
                    <TableCell>{rec.late || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default AttendanceOverview
