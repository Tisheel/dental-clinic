import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import dayjs from 'dayjs';
import client from '../../api/client';

export default function BlogAdmin() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', summary: '', content: '', image: '', metaTitle: '', metaDescription: '', metaKeywords: '', author: '', published: false });

  const fetchPosts = () => {
    client.get('/admin/blog').then((res) => setPosts(res.data)).catch(() => {});
  };

  useEffect(() => { fetchPosts(); }, []);

  const resetForm = () => {
    setForm({ title: '', slug: '', summary: '', content: '', image: '', metaTitle: '', metaDescription: '', metaKeywords: '', author: '', published: false });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await client.put(`/admin/blog/${editing}`, form);
      } else {
        await client.post('/admin/blog', form);
      }
      fetchPosts();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleEdit = (post) => {
    setForm({
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      image: post.image,
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      metaKeywords: post.metaKeywords || '',
      author: post.author || '',
      published: post.published,
    });
    setEditing(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post permanently?')) return;
    try {
      await client.delete(`/admin/blog/${id}`);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const togglePublish = async (post) => {
    try {
      await client.put(`/admin/blog/${post.id}`, { ...post, published: !post.published });
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Post' : 'New Post'}</h2>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Blog post title" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (auto-generated if empty)</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="url-friendly-slug" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image URL</label>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Summary</label>
              <input type="text" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief summary shown on blog listing" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Content (HTML)</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                rows={12} placeholder="<p>Write your blog post content in HTML...</p>" required />
            </div>
            {/* SEO Fields */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">SEO Settings</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                    <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SEO title (defaults to post title)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Author</label>
                    <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Author name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                  <input type="text" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search engine description (150-160 chars)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Keywords</label>
                  <input type="text" value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="comma, separated, keywords" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="published" className="text-sm text-gray-700">Publish immediately</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                {editing ? 'Save Changes' : 'Create Post'}
              </button>
              <button type="button" onClick={resetForm}
                className="border border-gray-200 px-5 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {posts.length === 0 && !showForm && (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
            <p className="text-gray-500 text-sm">No blog posts yet. Create your first post.</p>
          </div>
        )}
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex gap-4">
            {post.image && (
              <img src={post.image} alt={post.title}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover shrink-0 hidden sm:block" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    /{post.slug} &middot; {dayjs(post.createdAt).format('DD MMM YYYY')}
                  </p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                  post.published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
              {post.summary && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.summary}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => handleEdit(post)} title="Edit"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => togglePublish(post)} title={post.published ? 'Unpublish' : 'Publish'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    post.published ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'
                  }`}>
                  {post.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => handleDelete(post.id)} title="Delete"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
                {post.published && (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                    className="ml-auto text-xs text-blue-600 font-medium hover:underline">View</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
