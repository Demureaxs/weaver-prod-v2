'use client';
import React from 'react';
import { FileText, Edit3, CreditCard, Layers, ArrowRight, Clock, FileEdit } from 'lucide-react';
import { getDifficultyColor } from '../lib/utils';

export const Dashboard = ({ user }) => {
  return (
    <div className='animate-fade-in space-y-6'>
      <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6'>Dashboard</h2>

      {/* Metrics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Articles Generated */}
        <div className='bg-background p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Articles Generated</p>
            {/* Shows actual count of articles from the array */}
            <h3 className='text-3xl font-bold text-primary'>{user.articles ? user.articles.length : 0}</h3>
          </div>
          <div className='bg-primary/10 p-3 rounded-xl text-primary'>
            <FileText size={24} />
          </div>
        </div>

        {/* Active Drafts */}
        <div className='bg-background p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Active Drafts</p>
            <h3 className='text-3xl font-bold text-secondary'>{user.activeCount || 0}</h3>
          </div>
          <div className='bg-secondary/10 p-3 rounded-xl text-secondary'>
            <Edit3 size={24} />
          </div>
        </div>

        {/* Credits Remaining */}
        <div className='bg-background p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Credits Remaining</p>
            <h3 className={`text-3xl font-bold ${user.credits > 10 ? 'text-green-600' : 'text-red-600'}`}>{user.credits}</h3>
          </div>
          <div className='bg-green-500/10 p-3 rounded-xl text-green-500'>
            <CreditCard size={24} />
          </div>
        </div>

        {/* Current Plan */}
        <div className='bg-background p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Current Plan</p>
            <h3 className='text-2xl font-bold text-foreground'>{user.plan}</h3>
          </div>
          <div className='bg-foreground/10 p-3 rounded-xl text-foreground'>
            <Layers size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action / Upgrade Banner */}
      <div className='bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white shadow-lg'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='font-bold text-lg'>Running low on credits?</h3>
            <p className='text-indigo-100 text-sm opacity-90'>Upgrade your plan to unlock unlimited generation.</p>
          </div>
          <button className='bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors'>Upgrade Plan</button>
        </div>
      </div>

      {/* Recent Drafts / Articles List */}
      <div className='bg-background rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden'>
        <div className='p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-background/50'>
          <FileEdit className='text-primary' size={20} />
          <h3 className='font-bold text-foreground'>Recent Drafts</h3>
        </div>
        <div className='divide-y divide-gray-100 dark:divide-gray-700'>
          {user.articles && user.articles.length > 0 ? (
            user.articles.map((article, idx) => (
              <button
                key={article.id}
                className='w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group flex justify-between items-center'
              >
                <div>
                  <h4 className='font-semibold text-foreground group-hover:text-primary transition-colors'>{article.title}</h4>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs text-gray-400 flex items-center gap-1'>
                      <Clock size={10} /> {new Date(article.date).toLocaleDateString()}
                    </span>
                    <span className='text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide'>
                      {article.status || 'Draft'}
                    </span>
                  </div>
                </div>
                <div className='text-gray-300 group-hover:text-primary'>
                  <ArrowRight size={18} />
                </div>
              </button>
            ))
          ) : (
            <div className='p-8 text-center text-gray-400'>
              <p>No articles generated yet.</p>
              <p className='text-xs mt-1'>Go to the Generator tab to create your first post!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
