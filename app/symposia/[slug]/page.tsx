import { SymposiumDetail } from '@/src/views/SymposiumDetail'

type Props = { params: Promise<{ slug: string }> }

export default async function SymposiumDetailPage({ params }: Props) {
  const { slug } = await params
  return <SymposiumDetail slug={slug} />
}
