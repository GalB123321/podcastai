import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '@/lib/blogUtils';
import { Metadata } from 'next';

interface PageParams {
  params: {
    slug: string;
  };
}

// Generate SEO metadata per slug
export async function generateMetadata({ params: { slug } }: PageParams): Promise<Metadata> {
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Not Found', description: 'Page not found' };
  
  return {
    title: `${post.title} • PodcastAI`,
    description: post.excerpt,
  };
}

// Pre-render all blog slugs
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params: { slug } }: PageParams) {
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="bg-background text-textPrimary">
      <header className="max-w-3xl mx-auto py-12 px-4 text-center">
        <Image
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={600}
          className="rounded-xl mb-6"
          priority
        />
        <h1 className="text-4xl md:text-5xl font-display mb-2">
          {post.title}
        </h1>
        <time className="text-textSecondary">
          {new Date(post.date).toLocaleDateString()}
        </time>
      </header>

      {/* Content Section */}
      <section
        className="prose prose-invert lg:prose-xl max-w-3xl mx-auto px-4"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* Back to Blog Link */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/blog">
          <PrimaryButton>← Back to All Posts</PrimaryButton>
        </Link>
      </div>
    </article>
  );
} 