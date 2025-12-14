import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { KBArticle } from '@/lib/kb-types';

/**
 * Hook for fetching knowledge base articles
 */
export function useKBArticles(category?: string, searchQuery?: string) {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('knowledge_base_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (searchQuery && searchQuery.trim()) {
        // Full-text search
        query = query.textSearch('title', searchQuery);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setArticles(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching KB articles:', err);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, loading, error, refetch: fetchArticles };
}

/**
 * Hook for fetching a single article by slug
 */
export function useKBArticle(slug: string) {
  const [article, setArticle] = useState<KBArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('knowledge_base_articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (fetchError) throw fetchError;

      // Increment view count
      if (data) {
        await supabase
          .from('knowledge_base_articles')
          .update({ views: data.views + 1 })
          .eq('id', data.id);
      }

      setArticle(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching KB article:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return { article, loading, error, refetch: fetchArticle };
}

/**
 * Hook for submitting article feedback
 */
export function useKBFeedback() {
  const [submitting, setSubmitting] = useState(false);

  async function submitFeedback(
    articleId: string,
    helpful: boolean,
    feedbackText?: string
  ) {
    try {
      setSubmitting(true);

      // Insert feedback
      const { error: feedbackError } = await supabase
        .from('kb_feedback')
        .insert({
          article_id: articleId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          helpful,
          feedback_text: feedbackText
        });

      if (feedbackError) throw feedbackError;

      // Update article counts
      const field = helpful ? 'helpful_count' : 'not_helpful_count';
      const { data: article } = await supabase
        .from('knowledge_base_articles')
        .select(field)
        .eq('id', articleId)
        .single();

      if (article) {
        await supabase
          .from('knowledge_base_articles')
          .update({ [field]: (article[field] || 0) + 1 })
          .eq('id', articleId);
      }

      return true;
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return { submitFeedback, submitting };
}

/**
 * Hook for fetching related articles
 */
export function useRelatedArticles(articleIds: string[]) {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const articleIdsKey = articleIds.join(',');

  const fetchRelatedArticles = useCallback(async () => {
    if (!articleIds.length) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .select('*')
        .in('id', articleIds)
        .eq('published', true);

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching related articles:', err);
    } finally {
      setLoading(false);
    }
  }, [articleIds]);

  useEffect(() => {
    fetchRelatedArticles();
  }, [articleIdsKey, fetchRelatedArticles]);

  return { articles, loading };
}