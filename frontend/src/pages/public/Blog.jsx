import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { Clock } from 'lucide-react';
import { getCached } from '../../api/cache';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCached('/blog')
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <section className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-teal-300 font-semibold text-sm mb-2 uppercase tracking-wide">Our Blog</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Dental Health Insights</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">Expert tips, treatment guides, and the latest in dental care to help you maintain a healthy smile.</p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No blog posts yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {post.image && (
                    <img src={post.image} alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy" width={800} height={400} />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Clock size={12} />
                      <span>{dayjs(post.createdAt).format('DD MMM YYYY')}</span>
                    </div>
                    <h2 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{post.summary}</p>
                    <span className="inline-block mt-3 text-teal-700 text-sm font-medium">Read more</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Have Questions About Your Dental Health?</h2>
          <p className="text-gray-500 text-sm mb-6">Book a consultation with our experienced dentists.</p>
          <Link to="/book" className="inline-block bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition">
            Book Appointment
          </Link>
        </div>
      </section>
    </div>
  );
}
