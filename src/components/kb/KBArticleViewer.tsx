import { ArrowLeft, Eye, Clock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { KBFeedback } from './KBFeedback';
import { KBArticleCard } from './KBArticleCard';
import { useRelatedArticles } from '@/hooks/useKnowledgeBase';
import type { KBArticle } from '@/lib/kb-types';
import { KB_CATEGORIES } from '@/lib/kb-types';

interface KBArticleViewerProps {
  article: KBArticle;
  onBack: () => void;
  onArticleClick: (slug: string) => void;
}

export function KBArticleViewer({ article, onBack, onArticleClick }: KBArticleViewerProps) {
  const { articles: relatedArticles, loading: relatedLoading } = useRelatedArticles(
    article.related_articles || []
  );

  const category = KB_CATEGORIES.find(c => c.id === article.category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>
      </div>

      {/* Article */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Meta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <Badge variant="secondary">{category.name}</Badge>
              )}
              {article.video_url && (
                <Badge variant="outline" className="gap-1">
                  <Video className="h-3 w-3" />
                  Video Available
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              {article.title}
            </h1>

            <p className="text-lg text-muted-foreground">
              {article.summary}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{article.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Video */}
          {article.video_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={article.video_url}
                className="w-full h-full"
                allowFullScreen
                title={article.title}
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </CardContent>
      </Card>

      {/* Feedback */}
      <KBFeedback articleId={article.id} />

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Related Articles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map(relatedArticle => (
              <KBArticleCard
                key={relatedArticle.id}
                article={relatedArticle}
                onClick={() => onArticleClick(relatedArticle.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {relatedLoading && (
        <p className="text-center text-muted-foreground">Loading related articles...</p>
      )}
    </div>
  );
}
