import { ArticleDetail } from '@/src/views/ArticleDetail'

type Props = { params: Promise<{ slug: string }> }

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params
  return <ArticleDetail slug={slug} />
}
