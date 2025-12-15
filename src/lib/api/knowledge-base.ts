import { supabase } from '../supabase';
import { logger } from '../logger';
import { handleSupabaseError } from '../api-client';

export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KBArticle {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  tags?: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export class KnowledgeBaseAPI {
  // Categories
  static async getCategories(): Promise<KBCategory[]> {
    try {
      const { data, error } = await supabase
        .from('kb_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch KB categories', error as Error, { 
        component: 'KnowledgeBaseAPI' 
      });
      throw error;
    }
  }

  static async getCategoryBySlug(slug: string): Promise<KBCategory | null> {
    try {
      const { data, error } = await supabase
        .from('kb_categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) handleSupabaseError(error);

      return data;
    } catch (error) {
      logger.error('Failed to fetch KB category', error as Error, { 
        component: 'KnowledgeBaseAPI',
        slug 
      });
      throw error;
    }
  }

  // Articles
  static async getArticles(categoryId?: string): Promise<KBArticle[]> {
    try {
      let query = supabase
        .from('kb_articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch KB articles', error as Error, { 
        component: 'KnowledgeBaseAPI',
        categoryId 
      });
      throw error;
    }
  }

  static async getArticleBySlug(slug: string): Promise<KBArticle | null> {
    try {
      const { data, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) handleSupabaseError(error);

      // Increment view count
      if (data) {
        await this.incrementViewCount(data.id);
      }

      return data;
    } catch (error) {
      logger.error('Failed to fetch KB article', error as Error, { 
        component: 'KnowledgeBaseAPI',
        slug 
      });
      throw error;
    }
  }

  static async searchArticles(query: string): Promise<KBArticle[]> {
    try {
      const { data, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('view_count', { ascending: false })
        .limit(10);

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to search KB articles', error as Error, { 
        component: 'KnowledgeBaseAPI',
        query 
      });
      throw error;
    }
  }

  static async getPopularArticles(limit: number = 5): Promise<KBArticle[]> {
    try {
      const { data, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch popular articles', error as Error, { 
        component: 'KnowledgeBaseAPI' 
      });
      throw error;
    }
  }

  static async incrementViewCount(articleId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_view_count', {
        article_id: articleId,
      });

      // If RPC doesn't exist, fallback to manual increment
      if (error) {
        const { data: article } = await supabase
          .from('kb_articles')
          .select('view_count')
          .eq('id', articleId)
          .single();

        if (article) {
          await supabase
            .from('kb_articles')
            .update({ view_count: article.view_count + 1 })
            .eq('id', articleId);
        }
      }
    } catch (error) {
      logger.error('Failed to increment view count', error as Error, { 
        component: 'KnowledgeBaseAPI',
        articleId 
      });
    }
  }

  static async markHelpful(articleId: string, helpful: boolean): Promise<void> {
    try {
      const { data: article } = await supabase
        .from('kb_articles')
        .select('helpful_count, not_helpful_count')
        .eq('id', articleId)
        .single();

      if (article) {
        const updates = helpful
          ? { helpful_count: article.helpful_count + 1 }
          : { not_helpful_count: article.not_helpful_count + 1 };

        await supabase
          .from('kb_articles')
          .update(updates)
          .eq('id', articleId);
      }
    } catch (error) {
      logger.error('Failed to mark article helpful', error as Error, { 
        component: 'KnowledgeBaseAPI',
        articleId 
      });
      throw error;
    }
  }
}
