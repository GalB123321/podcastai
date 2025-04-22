import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPostSlugs, getPostBySlug } from '@/lib/blogUtils';
import { BlogWrapper } from '@/components/blog/BlogWrapper';
import { Metadata } from 'next';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  excerpt: string;
}

export const metadata: Metadata = {
  title: 'Blog • PodcastAI',
  description: 'Explore the latest insights, tips, and stories about podcast creation, AI technology, and content strategy.',
};

function FeaturedArticle({ post }: { post: BlogPost }) {
  return (
    <section className="relative h-[500px] bg-gradient-to-b from-background to-surface">
      <div className="absolute inset-0">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="text-accent text-sm font-medium uppercase tracking-wider mb-4 block">
          FEATURED ARTICLE
        </span>
        <h1 className="text-4xl md:text-6xl font-display mb-4">
          {post.title}
        </h1>
        <p className="text-textSecondary text-lg max-w-2xl mx-auto mb-8">
          {post.excerpt}
        </p>
        <Link 
          href={`/blog/${post.slug}`}
          className="inline-block px-8 py-3 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors"
        >
          Read Article
        </Link>
      </div>
    </section>
  );
}

export default async function BlogIndexPage() {
  const slugs = await getAllPostSlugs();
  const postsData = await Promise.all(
    slugs.map(async (slug) => {
      const post = await getPostBySlug(slug);
      return post ? {
        slug: post.slug,
        title: post.title,
        date: post.date,
        coverImage: post.coverImage,
        excerpt: post.excerpt,
      } : null;
    })
  );
  const posts = postsData.filter((post): post is BlogPost => post !== null);
  const categories = ['Most Recent', 'Relationships', 'LifeStyle', 'Self Love'];

  if (posts.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-display mb-4">
          Coming Soon
        </h1>
        <p className="text-textSecondary text-lg mb-8 max-w-2xl">
          We're working on some amazing content. Check back soon for insights about podcast creation, AI technology, and content strategy.
        </p>
        <Link href="/create">
          <button className="px-8 py-3 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors">
            Create Your First Episode
          </button>
        </Link>
      </div>
    );
  }

  return (
    <BlogWrapper posts={posts} categories={categories}>
      {posts[0] && <FeaturedArticle post={posts[0]} />}
    </BlogWrapper>
  );
} 