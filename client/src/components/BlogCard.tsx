/**
 * BlogCard Component - Reusable card for displaying blog articles
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Article } from '@/services/articleService';
import { format } from 'date-fns';
import { Link } from 'wouter';

interface BlogCardProps {
  article: Article;
  showCategory?: boolean;
  showExcerpt?: boolean;
  showDate?: boolean;
  isLoading?: boolean;
}

export function BlogCard({
  article,
  showCategory = true,
  showExcerpt = true,
  showDate = true,
  isLoading = false
}: BlogCardProps) {
  if (isLoading) {
    return (
      <Card className="flex flex-col h-full overflow-hidden">
        <div className="aspect-video bg-gray-200">
          <Skeleton className="w-full h-full" />
        </div>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex-1">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      {article.thumbnail && (
        <OptimizedImage
          src={article.thumbnail}
          alt={article.title}
          width={400}
          height={225}
          quality={80}
          placeholder="blur"
          className="aspect-video w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      )}

      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {showCategory && article.category && (
            <Badge variant="secondary" className="text-sm">
              {article.category}
            </Badge>
          )}
          {article.status === 'publish' && (
            <Badge variant="default" className="text-sm bg-green-100 text-green-800">
              Published
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-tight line-clamp-2">
          {article.title}
        </h3>
      </CardHeader>

      {showExcerpt && article.excerpt && (
        <CardContent className="flex-1 py-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>
        </CardContent>
      )}

      <CardFooter className="flex justify-between items-center pt-4">
        <div className="flex flex-col items-start">
          {showDate && article.published_at && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(article.published_at), 'MMM dd, yyyy')}
            </span>
          )}
          {showDate && !article.published_at && article.created_at && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(article.created_at), 'MMM dd, yyyy')}
            </span>
          )}
        </div>
        <Link href={`/blog/${article.slug}`}>
          <Button variant="outline" size="sm">
            Read More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function BlogCardSkeleton() {
  return <BlogCard isLoading={true} article={{} as Article} />;
}