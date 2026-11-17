import Link from 'next/link';
import {ShowTab, ShowTabKey} from './types';

type ShowTabsNavigationProps = {
    tabs: ShowTab[];
    activeTab: ShowTabKey;
    getHref: (tab: ShowTabKey) => string;
};

export const ShowTabsNavigation = ({tabs, activeTab, getHref}: ShowTabsNavigationProps) => (
    <nav className="border-b border-primary-300 dark:border-primary-800">
        <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => {
                const active = activeTab === tab.key;
                return (
                    <Link
                        key={tab.key}
                        href={getHref(tab.key)}
                        scroll={false}
                        aria-current={active ? 'page' : undefined}
                        className={`relative min-h-12 px-5 py-3 whitespace-nowrap font-medium transition-colors ${
                            active
                                ? 'text-primary-950 dark:text-primary-50'
                                : 'text-primary-500 hover:text-primary-950 dark:text-primary-400 dark:hover:text-primary-50'
                        }`}
                    >
                        {tab.label}
                        {active && <span className="ember-swipe swipe-cool absolute inset-x-3 -bottom-[3px] h-1.5" aria-hidden="true"/>}
                    </Link>
                );
            })}
        </div>
    </nav>
);
