'use client';
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[60] focus:px-4 focus:py-2 focus:bg-ember-500 focus:text-primary-950 rounded-[3px]"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="relative z-10 flex-1 container mx-auto px-4 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};
