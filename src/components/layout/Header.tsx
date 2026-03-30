'use client'

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sun, Moon, Languages, LogOut, UserCircle, LogIn } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { isInAppBrowser, openExternalBrowser } from '../auth/GoogleLoginButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { festivalConfig } from '../../config/festival';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
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

  const isRTL = i18n.language === 'ar';

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/festival', label: t('nav.editions') },
    { to: '/articles', label: t('nav.articles') },
    { to: '/creativity', label: t('nav.creativity') },
    { to: '/about', label: t('nav.about') },
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
    <header className="sticky top-0 z-50 bg-primary-50 text-primary-900 dark:bg-primary-950 dark:text-primary-50 border-b border-primary-100 dark:border-primary-800 shadow-xl transition-all duration-300">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 text-primary-50">
              <span className="text-2xl">{festivalConfig.logo}</span>
            </div>
            <div className={`hidden md:block ${isRTL ? 'text-right' : 'text-left'}`}>
              <h1 className="text-xl font-bold text-secondary-600 dark:text-secondary-400">
                {isRTL ? festivalConfig.titleAr : festivalConfig.titleEn}
              </h1>
              <p className="text-xs text-primary-600 dark:text-primary-300">
                {isRTL ? festivalConfig.subtitleAr : festivalConfig.subtitleEn}
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`${
                    isActive
                      ? 'text-secondary-500 dark:text-secondary-400'
                      : 'text-primary-900 dark:text-primary-100 hover:text-secondary-500 dark:hover:text-secondary-400'
                  } transition-colors duration-300 font-medium relative group`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 ${isActive ? 'w-full' : 'w-0'} h-0.5 bg-secondary-500 dark:bg-secondary-400 group-hover:w-full transition-all duration-300`}></span>
                </Link>
              );
            })}
            {isAuthenticated && (
              <Link
                href="/my-tickets"
                className={`${
                  isActiveLink('/my-tickets')
                    ? 'text-secondary-500 dark:text-secondary-400'
                    : 'text-primary-900 dark:text-primary-100 hover:text-secondary-500 dark:hover:text-secondary-400'
                } transition-colors duration-300 font-medium relative group`}
              >
                {t('myTickets.title')}
                <span className={`absolute bottom-0 left-0 ${isActiveLink('/my-tickets') ? 'w-full' : 'w-0'} h-0.5 bg-secondary-500 dark:bg-secondary-400 group-hover:w-full transition-all duration-300`}></span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-primary-100 text-primary-900 hover:bg-accent-600 hover:text-primary-50 dark:bg-primary-800 dark:text-primary-100 dark:hover:bg-accent-600 transition-colors duration-300"
              aria-label="Toggle language"
            >
              <Languages size={20} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-primary-100 text-primary-900 hover:bg-accent-600 hover:text-primary-50 dark:bg-primary-800 dark:text-primary-100 dark:hover:bg-accent-600 transition-colors duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {isAuthenticated && user ? (
              <div ref={userMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="p-2 transition-colors rounded-lg"
                  aria-label="User menu"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-secondary-500 dark:text-secondary-400 hover:text-secondary-400" />
                    <span className="text-sm font-medium text-primary-900 dark:text-primary-100">{user.name}</span>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute end-0 mt-2 w-52 rounded-lg bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 shadow-lg z-50 overflow-hidden">
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
              <div ref={loginDropdownRef} className="relative hidden md:block">
                <button
                  onClick={handleLoginClick}
                  className="p-2 rounded-lg bg-primary-100 text-primary-900 hover:bg-accent-600 hover:text-primary-50 dark:bg-primary-800 dark:text-primary-100 dark:hover:bg-accent-600 transition-colors duration-300"
                  aria-label={t('auth.signIn')}
                >
                  <LogIn size={20} />
                </button>
                {loginDropdownOpen && (
                  <div className="absolute end-0 mt-2 p-4 rounded-lg bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 shadow-lg z-50">
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
              className="md:hidden p-2 rounded-lg bg-primary-100 text-primary-900 hover:bg-accent-600 hover:text-primary-50 dark:bg-primary-800 dark:text-primary-100 dark:hover:bg-accent-600 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 animate-fadeIn">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-lg transition-colors duration-300 ${
                    isActive
                      ? 'bg-secondary-500 dark:bg-secondary-600 text-primary-50'
                      : 'text-primary-900 dark:text-primary-100 hover:bg-accent-600 hover:text-primary-50'
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
                    className={`block py-3 px-4 rounded-lg transition-colors duration-300 ${
                      isActiveLink('/my-tickets')
                        ? 'bg-secondary-500 dark:bg-secondary-600 text-primary-50'
                        : 'text-primary-900 dark:text-primary-100 hover:bg-accent-600 hover:text-primary-50'
                    }`}
                  >
                    🎟 {t('myTickets.title')}
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-2">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center text-white font-bold text-xs">
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
                    className="w-full flex items-center gap-2 py-3 px-4 rounded-lg text-primary-900 dark:text-primary-100 hover:bg-accent-600 hover:text-primary-50 transition-colors duration-300"
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
                      className="flex items-center gap-2 py-3 px-4 rounded-lg text-primary-900 dark:text-primary-100 hover:bg-accent-600 hover:text-primary-50 transition-colors duration-300"
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
