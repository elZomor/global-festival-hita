import { ArticleDetailPage } from './ArticleDetail';

export const SymposiumDetail = ({ slug }: { slug: string }) => (
  <ArticleDetailPage
    slug={slug}
    contentType="SYMPOSIA"
    translationNamespace="symposia"
    listPath="/symposia"
    detailPath="symposia"
  />
);
