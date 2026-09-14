"use client";

import { useMemo, useState } from "react";
import { BlogPostCard, type BlogPost } from "@/components/BlogPostCard";

// Client-side search over the blog listing — filters by title/excerpt.
// Sits below the featured post banner, which isn't affected by the
// search box (it stays visible as a constant "start here" pick).
export function BlogSearchGrid({
  posts,
  fallbackAuthorName,
}: {
  posts: BlogPost[];
  fallbackAuthorName: string;
}) {
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (post) => post.title.toLowerCase().includes(q) || post.excerpt?.toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts by title or keyword…"
        aria-label="Search blog posts"
        className="mb-8 w-full max-w-[420px] rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
      />

      {filteredPosts.length === 0 ? (
        <p className="text-[#555550]">No posts match that search — try a different keyword.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredPosts.map((post) => (
            <BlogPostCard key={post._id} post={post} fallbackAuthorName={fallbackAuthorName} />
          ))}
        </div>
      )}
    </div>
  );
}
