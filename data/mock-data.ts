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
    books: [
      {
        id: 'book1',
        title: 'The Secret Garden',
        chapters: [
          { id: 'chap1', title: 'The Beginning', content: 'Once upon a time...' },
          { id: 'chap2', title: 'The Middle', content: 'Things got interesting.' },
          { id: 'chap3', title: 'The End', content: 'They all lived happily ever after.' },
        ],
        characters: [
          { id: 'char1', name: 'Hero', bio: 'The main protagonist.' },
          { id: 'char2', name: 'Villian', bio: 'The main antagonist.' },
        ],
      },
      {
        id: 'book2',
        title: 'The Weaver\'s Craft',
        chapters: [
          {
            id: 'wc_chap1',
            title: 'Chapter 1: The Loom of Creation',
            content: `In the heart of the Verdant Valley, where rivers of liquid starlight flowed and mountains breathed with ancient slumber, stood the village of Silverstream. The villagers were known for their unique craft: weaving dreams into reality. They were called the Weavers, and their looms were no ordinary contraptions of wood and thread. They were conduits of pure imagination, powered by the collective unconscious of the world. Every night, the Weavers would enter a trance-like state, their hands dancing across the looms, their minds connected to the endless ocean of stories, myths, and legends. They would pull threads of moonlight, strands of forgotten memories, and filaments of raw emotion to create tapestries that were not just beautiful, but alive.`
          },
          {
            id: 'wc_chap2',
            title: 'Chapter 2: Elara\'s Gift',
            content: `Elara, a young Weaver with eyes the color of a twilight sky, was different. While others wove tales of epic heroes and grand adventures, she was drawn to the smaller, more intimate stories. She wove the quiet joy of a blooming flower, the bittersweet ache of a farewell, and the gentle hum of a sleeping city. Her tapestries were not as grand as the others, but they held a power that was just as profound. They resonated with the delicate, often overlooked, emotions that made up the fabric of everyday life. The elders, however, saw her gift as a liability. They feared that her focus on the mundane would weaken the Weavers' connection to the grander narratives that sustained their world.`
          },
          {
            id: 'wc_chap3',
            title: 'Chapter 3: The Fraying Tapestry',
            content: `One day, a shadow fell upon Silverstream. The Great Tapestry, the magnum opus of the Weavers that held their world together, began to fray. Colors faded, threads unraveled, and entire sections of their reality started to disappear. The elders, in their panic, tried to mend the tapestry with grand, powerful narratives, but their efforts only seemed to make things worse. The more they tried to impose order, the more chaotic the unraveling became. The very fabric of their existence was threatening to come undone, and the Weavers, for the first time in their history, were faced with the terrifying prospect of a world without stories.`
          },
          {
            id: 'wc_chap4',
            title: 'Chapter 4: The Unseen Threads',
            content: `It was Elara who noticed the cause of the decay. The Great Tapestry was not just made of grand epics, but also of the small, seemingly insignificant moments of life. The elders, in their focus on the heroic, had neglected the very foundation upon which their world was built. The quiet joys, the silent sorrows, the gentle hum of everyday life - these were the threads that held everything together. And now, they were breaking. Elara knew that to save their world, she had to convince the elders to see the value in the small, to embrace the power of the mundane, and to reweave the tapestry not with grand narratives, but with the authentic, heartfelt stories of their own lives.`
          },
          {
            id: 'wc_chap5',
            title: 'Chapter 5: The Weaver\'s Song',
            content: `With a courage she never knew she possessed, Elara began to sing. It was a song of her own creation, a melody woven from the threads of her own experiences. It was a song of love and loss, of joy and sorrow, of the beauty and fragility of life. As she sang, her hands danced across her loom, weaving a new tapestry, one that was not just grand, but also intimate. The other Weavers, drawn by the power of her song, joined in, their voices and looms creating a symphony of stories that was both epic and personal. The Great Tapestry, once frayed and faded, began to heal, its colors returning, its threads reweaving themselves into a new, more resilient whole. The world of the Weavers was not just saved, it was reborn, stronger and more beautiful than ever before.`
          }
        ],
        characters: [
          { id: 'wc_char1', name: 'Elara', bio: 'A young Weaver with a unique gift for weaving small, intimate stories.' },
          { id: 'wc_char2', name: 'The Elder', bio: 'The leader of the Weavers, who initially doubts Elara\'s methods.' },
        ],
      },
    ],
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
    books: [
      {
        id: 'book1',
        title: 'The Codebase',
        chapters: [
          { id: 'chap1', title: 'The First commit', content: 'The project was initialized' },
          { id: 'chap2', title: 'The Middle', content: 'Things got complicated.' },
          { id: 'chap3', title: 'The release', content: 'The project was deployed' },
        ],
        characters: [
          { id: 'char1', name: 'React', bio: 'A JavaScript library for building user interfaces.' },
          { id: 'char2', name: 'Next.js', bio: 'The React Framework for Production.' },
        ],
      },
      {
        id: 'book2',
        title: 'The API',
        chapters: [
          { id: 'chap1', title: 'The specification', content: 'The API was designed.' },
          { id: 'chap2', title: 'The implementation', content: 'The API was built.' },
        ],
        characters: [
          { id: 'char1', name: 'REST', bio: 'A popular architectural style for APIs.' },
          { id: 'char2', name: 'GraphQL', bio: 'A query language for APIs.' },
        ],
      }
    ]
  },
};
