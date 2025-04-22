'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CategoryFilters } from './CategoryFilters';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  excerpt: string;
}

interface BlogWrapperProps {
  posts: BlogPost[];
  categories: string[];
  children: React.ReactNode;
}

export function BlogWrapper({ posts, categories, children }: BlogWrapperProps) {
  const [activeCategory, setActiveCategory] = React.useState('Most Recent');
  const [filteredPosts, setFilteredPosts] = React.useState(posts);

  React.useEffect(() => {
    if (activeCategory === 'Most Recent') {
      setFilteredPosts(posts);
    } else {
      // In a real app, you would filter based on post categories
      // For now, we'll just show all posts
      setFilteredPosts(posts);
    }
  }, [activeCategory, posts]);

  return (
    <>
      {children}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CategoryFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article className="bg-surface rounded-xl overflow-hidden transition-transform hover:scale-[1.02]">
                <div className="relative h-48">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-display mb-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-textSecondary text-sm mb-4">
                    {post.excerpt}
                  </p>
                  <time className="text-sm text-textSecondary">
                    {new Date(post.date).toLocaleDateString()}
                  </time>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
} 