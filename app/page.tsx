import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome to BlogGenie</h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">AI-Powered Content Creation</p>
        <Link href="/dashboard" className="mt-8 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
