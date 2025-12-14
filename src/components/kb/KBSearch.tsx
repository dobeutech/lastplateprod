import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface KBSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function KBSearch({ onSearch, placeholder = 'Search articles...' }: KBSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-24 h-12 text-base"
        />
        <Button 
          type="submit" 
          className="absolute right-2 h-8"
          size="sm"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
