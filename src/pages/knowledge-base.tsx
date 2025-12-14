import { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KBSearch } from '@/components/kb/KBSearch';
import { KBCategoryCard } from '@/components/kb/KBCategoryCard';
import { KBArticleCard } from '@/components/kb/KBArticleCard';
import { KBArticleViewer } from '@/components/kb/KBArticleViewer';
import { useKBArticles, useKBArticle } from '@/hooks/useKnowledgeBase';
import { KB_CATEGORIES } from '@/lib/kb-types';

export default function KnowledgeBasePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'search'>('browse');

  const { articles, loading, error } = useKBArticles(selectedCategory, searchQuery);
  const { article: selectedArticle, loading: articleLoading } = useKBArticle(
    selectedArticleSlug || ''
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
    setSelectedCategory(undefined);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    setActiveTab('search');
  };

  const handleArticleClick = (slug: string) => {
    setSelectedArticleSlug(slug);
  };

  const handleBackToList = () => {
    setSelectedArticleSlug(null);
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSearchQuery('');
    setActiveTab('browse');
  };

  // If viewing an article
  if (selectedArticleSlug) {
    if (articleLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!selectedArticle) {
      return (
        <div className="space-y-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Article not found</p>
            <Button onClick={handleBackToList} className="mt-4">
              Back to Knowledge Base
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <KBArticleViewer
          article={selectedArticle}
          onBack={handleBackToList}
          onArticleClick={handleArticleClick}
        />
      </div>
    );
  }

  // Main knowledge base view
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <BookOpen className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Knowledge Base</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions, learn platform features, and discover best practices
        </p>
      </div>

      {/* Search */}
      <div className="flex justify-center">
        <KBSearch onSearch={handleSearch} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'browse' | 'search')}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="browse">Browse Categories</TabsTrigger>
          <TabsTrigger value="search">
            {searchQuery ? 'Search Results' : 'All Articles'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {KB_CATEGORIES.map(category => (
              <KBCategoryCard
                key={category.id}
                category={category}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search" className="mt-8">
          <div className="space-y-6">
            {/* Active Filters */}
            {(selectedCategory || searchQuery) && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedCategory && (
                  <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {KB_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  </div>
                )}
                {searchQuery && (
                  <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    Search: "{searchQuery}"
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">Error loading articles</p>
                <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
              </div>
            )}

            {/* Articles Grid */}
            {!loading && !error && (
              <>
                {articles.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {articles.map(article => (
                      <KBArticleCard
                        key={article.id}
                        article={article}
                        onClick={() => handleArticleClick(article.slug)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-muted-foreground">No articles found</p>
                    <Button onClick={clearFilters} variant="outline">
                      View all categories
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Help CTA */}
      <div className="text-center py-8 border-t">
        <p className="text-muted-foreground mb-4">
          Can't find what you're looking for?
        </p>
        <Button variant="outline">
          Contact Support
        </Button>
      </div>
    </div>
  );
}
