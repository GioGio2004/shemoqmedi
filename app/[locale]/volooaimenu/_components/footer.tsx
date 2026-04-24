"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight, Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
  const t = useTranslations('CoffeeTemplate3.Footer');

  return (
    <footer className="relative z-10 bg-black pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Noir<span className="text-orange-500">.</span>
            </h2>
            <div className="max-w-md">
              <h3 className="text-lg font-bold mb-2">{t('newsletter.title')}</h3>
              <p className="text-zinc-500 text-sm mb-6">{t('newsletter.description')}</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder={t('newsletter.placeholder')} 
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 w-full transition-colors"
                />
                <button className="bg-orange-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors text-sm">
                  {t('newsletter.button')}
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-zinc-500 mb-6">Sitemap</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#menu" className="hover:text-orange-500 transition-colors">{t('links.menu')}</a></li>
                <li><a href="#visit" className="hover:text-orange-500 transition-colors">{t('links.locations')}</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">{t('links.about')}</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">{t('links.contact')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-zinc-500 mb-6">Socials</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li>
                  <a href="#" className="flex items-center gap-2 hover:text-orange-500 transition-colors group">
                    Instagram <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 hover:text-orange-500 transition-colors group">
                    Twitter <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 hover:text-orange-500 transition-colors group">
                    Facebook <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-zinc-500 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <p>{t('copyright')}</p>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
