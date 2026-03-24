import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const navLinks = isHome
    ? [
        { href: '#services', label: 'Services' },
        { href: '#doctors', label: 'Doctors' },
        { href: '#about', label: 'About' },
        { href: '#testimonials', label: 'Reviews' },
        { href: '#faq', label: 'FAQ' },
        { href: '#contact', label: 'Contact' },
        { href: '/blog', label: 'Blog' },
      ]
    : [{ href: '/', label: 'Home' }, { href: '/blog', label: 'Blog' }];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="bg-teal-700 text-white text-xs sm:text-sm py-2 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>Advanced Preventive and Oral Care Center</span>
          <div className="flex items-center gap-4">
            <a href="tel:+916364562123" className="flex items-center gap-1 hover:text-teal-200">
              <Phone size={12} /> +91 6364562123
            </a>
            <a href="tel:08041683510" className="flex items-center gap-1 hover:text-teal-200">
              <Phone size={12} /> 080 41683510
            </a>
          </div>
        </div>
      </div>

      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Big Smile Dental Care" className="h-10 w-auto" />
              <div className="hidden min-[480px]:block">
                <span className="text-lg font-bold text-gray-900 leading-tight block">Big Smile Dental Care</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex gap-5 items-center">
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <a key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-teal-700 font-medium">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} to={link.href} className="text-sm text-gray-600 hover:text-teal-700 font-medium">
                    {link.label}
                  </Link>
                )
              )}
              <Link to="/book" className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-800 transition">
                Book Appointment
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map((link) =>
              link.href.startsWith('#') ? (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                  {link.label}
                </Link>
              )
            )}
            <Link to="/book" onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg bg-teal-700 text-white text-center text-sm font-semibold hover:bg-teal-800">
              Book Appointment
            </Link>
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-1">
              <a href="tel:+916364562123" className="text-sm text-gray-500 px-3 py-1">+91 6364562123</a>
              <a href="tel:08041683510" className="text-sm text-gray-500 px-3 py-1">080 41683510</a>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-900 text-gray-400 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/logo.jpg" alt="Big Smile Dental Care" className="h-12 w-auto mb-3 brightness-200" />
              <p className="text-sm leading-relaxed">Advanced Preventive and Oral Care Center. Personalized dental care using the latest technology.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link to="/" className="block hover:text-white">Home</Link>
                <Link to="/book" className="block hover:text-white">Book Appointment</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
              <div className="space-y-2 text-sm">
                <p>+91 6364562123</p>
                <p>080 41683510</p>
                <p>Bangalore, Karnataka</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Hours</h4>
              <div className="space-y-2 text-sm">
                <p>Mon - Sat: 9:00 AM - 6:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Big Smile Dental Care. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
