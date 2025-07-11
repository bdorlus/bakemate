// Storybook stubs for BakeMate MVP
// Each file below should live under src/stories/
// Components referenced do not yet exist – generate them with the same names under src/features/*
// Wrap every story in the <AppProviders> (QueryClientProvider + Theme) once it’s created.

/* --------------------------------------------------
   helpers/MockProviders.tsx – common decorator
-------------------------------------------------- */

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function MockProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/* --------------------------------------------------
   Dashboard.stories.tsx (A‑1)
-------------------------------------------------- */

import type { Meta, StoryObj } from '@storybook/react';
import { Dashboard } from '../features/dashboard/Dashboard';
import { MockProviders } from './helpers/MockProviders';

const meta: Meta<typeof Dashboard> = {
  title: 'Pages/Dashboard',
  component: Dashboard,
  decorators: [(Story) => <MockProviders><Story /></MockProviders>],
};
export default meta;

type Story = StoryObj<typeof Dashboard>;
export const Default: Story = {};

/* --------------------------------------------------
   NewQuoteModal.stories.tsx (A‑1 modal)
-------------------------------------------------- */

import type { Meta, StoryObj } from '@storybook/react';
import { NewQuoteModal } from '../features/orders/NewQuoteModal';
import { MockProviders } from './helpers/MockProviders';

const metaNew: Meta<typeof NewQuoteModal> = {
  title: 'Orders/NewQuoteModal',
  component: NewQuoteModal,
  decorators: [(Story) => <MockProviders><Story /></MockProviders>],
  args: { open: true },
};
export default metaNew;

type StoryNew = StoryObj<typeof NewQuoteModal>;
export const Open: StoryNew = {};

/* --------------------------------------------------
   QuoteBuilder.stories.tsx (A‑2)
-------------------------------------------------- */

import type { Meta, StoryObj } from '@storybook/react';
import { QuoteBuilder } from '../features/orders/QuoteBuilder';
import { MockProviders } from './helpers/MockProviders';

const metaQB: Meta<typeof QuoteBuilder> = {
  title: 'Orders/QuoteBuilder',
  component: QuoteBuilder,
  decorators: [(Story) => <MockProviders><Story /></MockProviders>],
  parameters: { layout: 'fullscreen' },
};
export default metaQB;

type StoryQB = StoryObj<typeof QuoteBuilder>;
export const FilledWithItems: StoryQB = { args: { mockQuoteId: 'q‑1234' } };

/* More stub stories would continue here for each storyboard frame… */