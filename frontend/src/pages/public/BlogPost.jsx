import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { ArrowLeft, Clock, Phone, User } from 'lucide-react';
import client from '../../api/client';

function useSeoMeta(post) {
  useEffect(() => {
    if (!post) return;

    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.summary || '';
    const keywords = post.metaKeywords || '';

    document.title = title;

    const setMeta = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setOg = (property, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('keywords', keywords);
    setOg('og:title', title);
    setOg('og:description', description);
    setOg('og:type', 'article');
    setOg('og:image', post.image || '');
    setOg('og:url', window.location.href);

    // BlogPosting structured data
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: description,
      image: post.image || '',
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Organization',
        name: post.author || 'Big Smile Dental Care',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Big Smile Dental Care',
      },
      mainEntityOfPage: window.location.href,
    };

    let scriptEl = document.getElementById('blog-schema');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'blog-schema';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schema);

    return () => {
      const el = document.getElementById('blog-schema');
      if (el) el.remove();
    };
  }, [post]);
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/blog/${slug}`)
      .then((res) => setPost(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useSeoMeta(post);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!post) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Blog post not found.</p>
      <Link to="/blog" className="text-teal-700 font-medium">Back to Blog</Link>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      {post.image && (
        <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-900">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 mb-6">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Clock size={13} /> {dayjs(post.createdAt).format('DD MMMM YYYY')}</span>
          {post.author && (
            <span className="flex items-center gap-1"><User size={13} /> {post.author}</span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>

        {post.summary && (
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">{post.summary}</p>
        )}

        {/* Blog Content */}
        <div className="prose prose-gray max-w-none
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-2
          [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-[15px]
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
          [&_li]:text-gray-600 [&_li]:text-[15px]
          [&_strong]:text-gray-900
          [&_a]:text-teal-700 [&_a]:underline
        " dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* CTA */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Need dental care?</h3>
          <p className="text-gray-500 text-sm mb-4">Book an appointment with our experienced dentists at Big Smile Dental Care.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/book" className="inline-block bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-teal-800 transition">
              Book Appointment
            </Link>
            <a href="tel:+916364562123" className="inline-flex items-center justify-center gap-2 border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              <Phone size={14} /> +91 6364562123
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
