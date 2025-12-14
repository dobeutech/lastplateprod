import { Clock, Eye, ThumbsUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { KBArticle } from '@/lib/kb-types';

interface KBArticleCardProps {
  article: KBArticle;
  onClick: () => void;
}

export function KBArticleCard({ article, onClick }: KBArticleCardProps) {
  const totalFeedback = article.helpful_count + article.not_helpful_count;
  const helpfulPercentage = totalFeedback > 0 
    ? Math.round((article.helpful_count / totalFeedback) * 100) 
    : null;

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold line-clamp-2">
              {article.title}
            </CardTitle>
            {article.video_url && (
              <Badge variant="secondary" className="shrink-0">
                Video
              </Badge>
            )}
          </div>
          
          <CardDescription className="line-clamp-2">
            {article.summary}
          </CardDescription>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{article.views}</span>
            </div>
            {helpfulPercentage !== null && (
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{helpfulPercentage}% helpful</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
