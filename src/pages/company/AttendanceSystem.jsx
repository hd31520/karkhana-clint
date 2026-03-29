import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, CalendarRange, Download, Gauge, RefreshCcw, TrendingUp } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

const quickYearOptions = [2, 3, 4]

const AttendanceSystem = () => {
  const { currentCompany } = useAuth()
  const companyId = currentCompany?.id || currentCompany?._id

  const [period, setPeriod] = useState('weekly') // weekly | monthly | yearly
  const [spanYears, setSpanYears] = useState(1)
  const [customYears, setCustomYears] = useState(3)

  const { data: res, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['attendance-system', companyId, period, spanYears],
    queryFn: async () => {
      if (!companyId) return null
      const params = {
        companyId,
        granularity: period,
        spanYears,
        includeOwner: true,
        includeUsers: true,
      }
      if (period === 'weekly') params.weeks = 12
      return api.get('/workers/attendance/summary', { params })
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  })

  const summary = res?.summary || {
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

  const handleApplyYears = () => {
    const value = Number(customYears)
    if (!Number.isNaN(value) && value > 0) {
      setSpanYears(value)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance System</h1>
          <p className="text-muted-foreground">
            Weekly, monthly, and yearly views with adjustable multi-year windows.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isRefetching ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Period &amp; Range</CardTitle>
          <CardDescription>Select granularity and how many years of data to include.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value={period}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm font-medium">Quick years</CardTitle>
                    <CardDescription>Set span in a tap</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {quickYearOptions.map((n) => (
                      <Button
                        key={n}
                        variant={spanYears === n ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSpanYears(n)}
                      >
                        Last {n}y
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm font-medium">Custom years</CardTitle>
                    <CardDescription>Any positive number</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      value={customYears}
                      onChange={(e) => setCustomYears(e.target.value)}
                      className="w-24"
                    />
                    <Button variant="default" size="sm" onClick={handleApplyYears}>
                      Apply
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm font-medium">Current scope</CardTitle>
                    <CardDescription>What you are viewing</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Badge variant="secondary" className="w-fit">
                      {period === 'weekly' ? 'Weekly (last 12w)' : period.charAt(0).toUpperCase() + period.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="w-fit">
                      Span: {spanYears} {spanYears === 1 ? 'year' : 'years'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Present" value={summary.present || 0} icon={<Gauge className="h-4 w-4 text-green-600" />} hint="Checked-in counts" />
        <StatCard title="Absent" value={summary.absent || 0} icon={<CalendarRange className="h-4 w-4 text-red-600" />} hint="Days missed" />
        <StatCard title="Total Records" value={summary.total || 0} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} hint="Entries in range" />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
          hint="Present / Total"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Per-worker breakdown for the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[780px]">
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading attendance...
                  </TableCell>
                </TableRow>
              ) : (summary.records || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No attendance data for this selection.
                  </TableCell>
                </TableRow>
              ) : (
                summary.records.map((rec) => {
                  const name = rec.name || rec.workerName || rec.fullName || rec.workerId
                  const role = rec.role || rec.userRole || '—'
                  const email = rec.email || rec.userEmail || '—'
                  return (
                    <TableRow key={`${rec.workerId || rec.id || name}-${rec.periodLabel || period}`}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{role}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{email}</TableCell>
                      <TableCell>{rec.present ?? 0}</TableCell>
                      <TableCell>{rec.absent ?? 0}</TableCell>
                      <TableCell>{rec.late ?? 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rec.periodLabel || period}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

const StatCard = ({ title, value, icon, hint }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </CardContent>
  </Card>
)

export default AttendanceSystem
