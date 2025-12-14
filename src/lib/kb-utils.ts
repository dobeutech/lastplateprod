/**
 * Knowledge Base Utility Functions
 * Helper functions for managing KB articles
 */

import { supabase } from './supabase';
import type { KBArticle } from './kb-types';

/**
 * Search articles using full-text search
 */
export async function searchArticles(query: string): Promise<KBArticle[]> {
  const { data, error } = await supabase
    .from('knowledge_base_articles')
    .select('*')
    .eq('published', true)
    .textSearch('title', query);

  if (error) {
    console.error('Error searching articles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get popular articles (most viewed)
 */
export async function getPopularArticles(limit = 5): Promise<KBArticle[]> {
  const { data, error } = await supabase
    .from('knowledge_base_articles')
    .select('*')
    .eq('published', true)
    .order('views', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular articles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get most helpful articles
 */
export async function getMostHelpfulArticles(limit = 5): Promise<KBArticle[]> {
  const { data, error } = await supabase
    .from('knowledge_base_articles')
    .select('*')
    .eq('published', true)
    .order('helpful_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching helpful articles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get articles by category with count
 */
export async function getArticleCountByCategory(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('knowledge_base_articles')
    .select('category')
    .eq('published', true);

  if (error) {
    console.error('Error fetching category counts:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  data.forEach(article => {
    counts[article.category] = (counts[article.category] || 0) + 1;
  });

  return counts;
}

/**
 * Convert markdown to HTML (simple converter)
 * For production, consider using a library like marked or remark
 */
export function markdownToHtml(markdown: string): string {
  // This is a simple implementation
  // For production, use a proper markdown library
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  return html;
}

/**
 * Calculate article helpfulness percentage
 */
export function calculateHelpfulness(article: KBArticle): number | null {
  const total = article.helpful_count + article.not_helpful_count;
  if (total === 0) return null;
  return Math.round((article.helpful_count / total) * 100);
}

/**
 * Format article content for display
 */
export function formatArticleContent(content: string): string {
  // Remove extra whitespace
  content = content.trim();
  
  // Ensure proper HTML structure
  if (!content.startsWith('<')) {
    content = markdownToHtml(content);
  }

  return content;
}
