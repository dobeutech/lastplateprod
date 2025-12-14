import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKBFeedback } from '@/hooks/useKnowledgeBase';
import { toast } from 'sonner';

interface KBFeedbackProps {
  articleId: string;
}

export function KBFeedback({ articleId }: KBFeedbackProps) {
  const [voted, setVoted] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showTextarea, setShowTextarea] = useState(false);
  const { submitFeedback, submitting } = useKBFeedback();

  const handleVote = async (helpful: boolean) => {
    setVoted(helpful);
    setShowTextarea(true);
    
    // Submit vote immediately
    const success = await submitFeedback(articleId, helpful);
    if (success) {
      toast.success('Thank you for your feedback!');
    }
  };

  const handleSubmitText = async () => {
    if (voted === null) return;
    
    const success = await submitFeedback(articleId, voted, feedbackText);
    if (success) {
      toast.success('Feedback submitted!');
      setShowTextarea(false);
    } else {
      toast.error('Failed to submit feedback');
    }
  };

  if (voted !== null && !showTextarea) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Thank you for your feedback!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Was this article helpful?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {voted === null ? (
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleVote(true)}
              disabled={submitting}
              className="gap-2"
            >
              <ThumbsUp className="h-5 w-5" />
              Yes
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleVote(false)}
              disabled={submitting}
              className="gap-2"
            >
              <ThumbsDown className="h-5 w-5" />
              No
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="Tell us more (optional)..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTextarea(false);
                  setFeedbackText('');
                }}
              >
                Skip
              </Button>
              <Button onClick={handleSubmitText} disabled={submitting}>
                Submit Feedback
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
