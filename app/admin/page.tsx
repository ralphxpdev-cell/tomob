import { requireAdminSession, listLeads } from './actions'
import { AdminList } from './AdminList'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdminSession()
  const leads = await listLeads()

  return <AdminList rows={leads} />
}
