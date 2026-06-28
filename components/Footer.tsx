import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Search, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-auto text-gray-300 overflow-hidden">
      {/* Aurora canvas */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: '#0b0718',
          backgroundImage:
            'radial-gradient(800px 400px at 100% 0%, rgba(217,70,239,0.22), transparent 60%), radial-gradient(700px 400px at 0% 100%, rgba(124,58,237,0.28), transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl aurora-gradient shadow-lg">
                <Search className="w-5 h-5 text-white" />
              </span>
              <span className="font-display text-lg font-extrabold text-white">
                Lost &amp; Found
              </span>
            </Link>
            <p className="text-sm text-violet-100/70 leading-relaxed">
              A secure, AI-powered platform that reunites people with what
              matters most — with privacy by default.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse" className="hover:text-fuchsia-300 transition">Browse Reports</Link></li>
              <li><Link to="/add-report" className="hover:text-fuchsia-300 transition">Add a Report</Link></li>
              <li><Link to="/rewards" className="hover:text-fuchsia-300 transition">Rewards & Wallet</Link></li>
              <li><Link to="/my-reports" className="hover:text-fuchsia-300 transition">My Reports</Link></li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4">Trust & Safety</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-fuchsia-300 transition">How It Works</a></li>
              <li><a href="#" className="hover:text-fuchsia-300 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-fuchsia-300 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-fuchsia-300 transition">Safety Tips</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-fuchsia-300" /> support@lostandfound.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-fuchsia-300" /> +20 123 456 7890</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-300" /> Cairo, Egypt</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-violet-100/60 inline-flex items-center gap-1.5">
            © {new Date().getFullYear()} Lost &amp; Found Platform · Built with
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" /> for reunions.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-violet-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Privacy first · No contact details ever exposed
          </div>
        </div>
      </div>
    </footer>
  );
}
