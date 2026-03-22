'use client';
import {ShowTab, ShowTabKey} from './types';

type ShowTabsNavigationProps = {
    tabs: ShowTab[];
    activeTab: ShowTabKey;
    onTabChange: (tab: ShowTabKey) => void;
};

export const ShowTabsNavigation = ({tabs, activeTab, onTabChange}: ShowTabsNavigationProps) => (
    <div className="border-b border-primary-300 dark:border-primary-700">
        <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
                        activeTab === tab.key
                            ? 'border-secondary-500 text-accent-600 dark:text-secondary-500'
                            : 'border-transparent text-primary-600 dark:text-primary-400 hover:text-accent-600 dark:hover:text-secondary-500'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    </div>
);
