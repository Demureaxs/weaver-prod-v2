export const INITIAL_MOCK_DB = {
  user_alice: {
    uid: 'user_alice',
    email: 'alice@garden-guru.com',
    displayName: 'Alice (Gardener)',
    credits: 50,
    plan: 'Free',
    activeCount: 0,
    sitemap: [
      'https://garden-guru.com/home',
      'https://garden-guru.com/services/landscaping',
      'https://garden-guru.com/services/pruning',
      'https://garden-guru.com/blog/winter-tips',
      'https://garden-guru.com/contact',
    ],
    keywords: ['organic mulch tips', 'winter pruning guide', 'best drought resistant plants'],
    articles: [], // Stores generated content
  },
  user_bob: {
    uid: 'user_bob',
    email: 'bob@tech-stack.io',
    displayName: 'Bob (Dev)',
    credits: 50,
    plan: 'Free',
    activeCount: 0,
    sitemap: [
      'https://tech-stack.io/',
      'https://tech-stack.io/docs/react',
      'https://tech-stack.io/docs/firebase',
      'https://tech-stack.io/pricing',
      'https://tech-stack.io/api-reference',
    ],
    keywords: ['react state management', 'firebase security rules', 'nextjs vs remix'],
    articles: [],
  },
};
