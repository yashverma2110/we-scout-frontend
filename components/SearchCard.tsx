'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface SearchCardProps {
  title: string;
  icon: React.ReactNode;
  queries: string[];
  colorClass: string;
}

const SearchCard: React.FC<SearchCardProps> = ({ title, icon, queries, colorClass }) => {
  const handleSearch = (query: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="group hover:shadow-md h-full overflow-hidden">
      <div className={`h-1.5 w-full ${colorClass.split(' ')[0]}`} />
      <CardHeader className="pb-3 flex flex-row items-center space-x-3 space-y-0">
        <div className={`p-2 rounded-lg text-white ${colorClass.split(' ')[0]}`}>
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {queries.map((query, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleSearch(query)}
              className="w-full justify-between text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 h-auto py-2 px-2 text-left items-start font-normal group/item"
            >
              <span className="text-sm line-clamp-2 pr-2">{query}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-blue-500 flex-shrink-0 mt-0.5" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchCard;
