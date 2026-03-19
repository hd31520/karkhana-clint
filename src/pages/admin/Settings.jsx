import { useAuth } from '../../contexts/AuthContext'
import { canAccessAdmin } from '../../lib/roleUtils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

const AdminSettings = () => {
  const { user } = useAuth()

  // Check access
  if (!canAccessAdmin(user?.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the Settings page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Settings</h1>
      <p className="text-muted-foreground">
        Placeholder settings page. Configure platform settings, subscriptions, and system options here.
      </p>
    </div>
  )
}

export default AdminSettings

