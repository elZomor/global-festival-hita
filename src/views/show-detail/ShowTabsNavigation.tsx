import Link from 'next/link';
import {ShowTab, ShowTabKey} from './types';

type ShowTabsNavigationProps = {
    tabs: ShowTab[];
    activeTab: ShowTabKey;
    getHref: (tab: ShowTabKey) => string;
};

export const ShowTabsNavigation = ({tabs, activeTab, getHref}: ShowTabsNavigationProps) => (
    <div className="border-b border-primary-300 dark:border-primary-700">
        <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
                <Link
                    key={tab.key}
                    href={getHref(tab.key)}
                    scroll={false}
                    className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
                        activeTab === tab.key
                            ? 'border-secondary-500 text-accent-600 dark:text-secondary-500'
                            : 'border-transparent text-primary-600 dark:text-primary-400 hover:text-accent-600 dark:hover:text-secondary-500'
                    }`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    </div>
);
