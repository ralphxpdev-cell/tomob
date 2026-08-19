import { notFound } from 'next/navigation'
import { requireAdminSession, getLeadDetail } from '../../actions'
import { LeadDetail } from './LeadDetail'

export const dynamic = 'force-dynamic'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession()
  const { id } = await params
  const detail = await getLeadDetail(id)
  if (!detail) notFound()
  return <LeadDetail lead={detail} />
}
