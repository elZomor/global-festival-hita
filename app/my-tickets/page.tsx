import type { Metadata } from 'next'
import { MyTickets } from '@/src/views/MyTickets'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
export const metadata: Metadata = { title: 'My Tickets', alternates: { canonical: `${siteUrl}/my-tickets` } }
export default function MyTicketsPage() { return <MyTickets /> }
