import { CreativityDetail } from '@/src/views/CreativityDetail'

type Props = { params: Promise<{ slug: string }> }

export default async function CreativityDetailPage({ params }: Props) {
  const { slug } = await params
  return <CreativityDetail slug={slug} />
}
