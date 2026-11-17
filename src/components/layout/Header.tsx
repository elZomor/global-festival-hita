'use client'

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useT } from '../../i18n/useT';
import { Menu, X, Sun, Moon, LogOut, UserCircle, LogIn } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { isInAppBrowser, openExternalBrowser } from '../auth/GoogleLoginButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { festivalConfig } from '../../config/festival';
import { KilnMark } from './Wordmark';
import { EgyptFlag, UKFlag } from './Flags';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const t = useT();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loginWithGoogleCredential, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target as Node)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isRTL = locale === 'ar';

  const toggleLanguage = () => {
    const newLang = locale === 'ar' ? 'en' : 'ar';
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.refresh();
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/festival', label: t('nav.editions') },
    { to: '/articles', label: t('nav.articles') },
    { to: '/creativity', label: t('nav.creativity') },
    { to: '/about', label: t('nav.about') },
    ...(festivalConfig.applicationsEnabled ? [{ to: '/apply', label: t('nav.apply') }] : []),
  ];

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleLoginClick = () => {
    if (isInAppBrowser) {
      openExternalBrowser();
    } else {
      setLoginDropdownOpen(prev => !prev);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-primary-50/90 text-primary-900 dark:bg-primary-950/85 dark:text-primary-50 border-b border-primary-200 dark:border-primary-800 backdrop-blur-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group text-primary-950 dark:text-primary-50 hover:text-primary-950 dark:hover:text-primary-50">
            <KilnMark className="w-11 h-11 shrink-0" />
            <div className="hidden sm:block text-start leading-tight">
              <p className="font-display text-xl">
                {isRTL ? festivalConfig.titleAr : festivalConfig.titleEn}
              </p>
              <p className="text-xs text-primary-500 dark:text-primary-400">
                {isRTL ? festivalConfig.subtitleAr : festivalConfig.subtitleEn}
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${
                    isActive
                      ? 'text-primary-950 dark:text-primary-50'
                      : 'text-primary-600 dark:text-primary-300 hover:text-primary-950 dark:hover:text-primary-50'
                  } relative py-2 text-[0.95rem] font-medium transition-colors duration-200 group`}
                >
                  {link.label}
                  <span className={`ember-swipe swipe-cool absolute -bottom-1 inset-x-0 h-1.5 origin-[inline-start] transition-transform duration-300 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 opacity-60'}`} aria-hidden="true"></span>
                </Link>
              );
            })}
            {isAuthenticated && (
              <Link
                href="/my-tickets"
                aria-current={isActiveLink('/my-tickets') ? 'page' : undefined}
                className={`${
                  isActiveLink('/my-tickets')
                    ? 'text-primary-950 dark:text-primary-50'
                    : 'text-primary-600 dark:text-primary-300 hover:text-primary-950 dark:hover:text-primary-50'
                } relative py-2 text-[0.95rem] font-medium transition-colors duration-200 group`}
              >
                {t('myTickets.title')}
                <span className={`ember-swipe swipe-cool absolute -bottom-1 inset-x-0 h-1.5 transition-transform duration-300 ease-out ${isActiveLink('/my-tickets') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 opacity-60'}`} aria-hidden="true"></span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center justify-center gap-2 h-11 px-3 rounded-[3px] border border-primary-300 text-sm font-medium text-primary-700 hover:border-ember-500 hover:text-ember-600 dark:border-primary-700 dark:text-primary-200 dark:hover:text-ember-400 transition-colors duration-200"
              aria-label={isRTL ? 'Switch to English' : 'التبديل إلى العربية'}
              title={isRTL ? 'English' : 'العربية'}
              lang={isRTL ? 'en' : 'ar'}
            >
              {isRTL ? <UKFlag className="w-6 h-4 rounded-[2px] ring-1 ring-primary-950/10" /> : <EgyptFlag className="w-6 h-4 rounded-[2px] ring-1 ring-primary-950/10" />}
              <span>{isRTL ? 'EN' : 'ع'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-11 h-11 rounded-[3px] border border-primary-300 text-primary-700 hover:border-ember-500 hover:text-ember-600 dark:border-primary-700 dark:text-primary-200 dark:hover:text-ember-400 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
            </button>

            {isAuthenticated && user ? (
              <div ref={userMenuRef} className="relative hidden lg:block">
                <button
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="inline-flex items-center gap-2 min-h-11 px-3 rounded-[3px] border border-primary-300 dark:border-primary-700 hover:border-ember-500 transition-colors"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-ember-500" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-primary-900 dark:text-primary-100 max-w-[10rem] truncate">{user.name}</span>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute end-0 mt-2 w-52 rounded-[3px] bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 shadow-glow-dark z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-primary-200 dark:border-primary-700">
                      <p className="text-sm font-medium text-primary-900 dark:text-primary-50 truncate">{user.name}</p>
                      <p className="text-xs text-primary-500 dark:text-primary-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
                    >
                      <LogOut size={16} />
                      {t('auth.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div ref={loginDropdownRef} className="relative hidden lg:block">
                <button
                  onClick={handleLoginClick}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-[3px] border border-primary-300 text-primary-700 hover:border-ember-500 hover:text-ember-600 dark:border-primary-700 dark:text-primary-200 dark:hover:text-ember-400 transition-colors duration-200"
                  aria-label={t('auth.signIn')}
                >
                  <LogIn size={18} strokeWidth={1.5} />
                </button>
                {loginDropdownOpen && (
                  <div className="absolute end-0 mt-2 p-4 rounded-[3px] bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 shadow-glow-dark z-50">
                    <div style={{ cursor: 'pointer', touchAction: 'manipulation' }}>
                      <GoogleLogin
                        onSuccess={async ({ credential }) => {
                          if (credential) {
                            setLoginDropdownOpen(false);
                            try { await loginWithGoogleCredential(credential); } catch { /* failed */ }
                          }
                        }}
                        onError={() => setLoginDropdownOpen(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-[3px] border border-primary-300 text-primary-700 hover:border-ember-500 dark:border-primary-700 dark:text-primary-200 transition-colors duration-200"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pb-4 space-y-1 border-t border-primary-200 dark:border-primary-800 pt-3 animate-fadeIn">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-[3px] font-medium transition-colors duration-200 ${
                    isActive
                      ? 'glaze text-primary-950 dark:text-primary-50 border-s-2 border-ember-500'
                      : 'text-primary-800 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-primary-200 dark:border-primary-700">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/my-tickets"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 px-4 rounded-[3px] font-medium transition-colors duration-200 ${
                      isActiveLink('/my-tickets')
                        ? 'glaze text-primary-950 dark:text-primary-50 border-s-2 border-ember-500'
                        : 'text-primary-800 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900'
                    }`}
                  >
                    {t('myTickets.title')}
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-2">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-ember-500 flex items-center justify-center text-primary-950 font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-primary-900 dark:text-primary-50">{user.name}</p>
                      <p className="text-xs text-primary-500 dark:text-primary-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 py-3 px-4 rounded-[3px] text-primary-800 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    {t('auth.signOut')}
                  </button>
                </>
              ) : (
                <div className="flex justify-center py-2">
                  {isInAppBrowser ? (
                    <button
                      onClick={openExternalBrowser}
                      className="flex items-center gap-2 py-3 px-4 rounded-[3px] text-primary-800 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors duration-200"
                    >
                      <LogIn size={16} />
                      {t('auth.openInBrowser')}
                    </button>
                  ) : (
                    <div style={{ cursor: 'pointer', touchAction: 'manipulation' }}>
                      <GoogleLogin
                        onSuccess={async ({ credential }) => {
                          setMobileMenuOpen(false);
                          if (credential) {
                            try { await loginWithGoogleCredential(credential); } catch { /* failed */ }
                          }
                        }}
                        onError={() => setMobileMenuOpen(false)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
