# Refactor Checklist

- [x] Create a new directory `app/dashboard`
- [x] Move the current `app/page.tsx` to `app/dashboard/page.tsx`
- [x] Create a new `app/page.tsx` for the homepage
- [x] Create a `data` directory and a `mock-data.ts` file
- [x] Move the mock data from `app/dashboard/page.tsx` to `data/mock-data.ts`
- [x] Create a `components` directory
- [x] Move the `ErrorBoundary` component to `components/ErrorBoundary.tsx`
- [x] Move the `Typewriter` component to `components/Typewriter.tsx`
- [x] Move the `formatText` function to `lib/utils.ts`
- [x] Move the `EditableBlock` component to `components/EditableBlock.tsx`
- [x] Move the `SimpleMarkdown` component to `components/SimpleMarkdown.tsx`
- [x] Move the `AuthScreen` component to `components/AuthScreen.tsx`
- [x] Move the `Dashboard` component to `components/Dashboard.tsx`
- [ ] Update all the imports in the new files
