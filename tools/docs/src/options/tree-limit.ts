import { defineOption } from 'cmdore';

import { integer } from './integer.ts';

export const treeLimit = defineOption({
  name: 'limit',
  description: 'Entries to show (1–60).',
  arity: 1,
  defaultValue: () => 60,
  coerce: integer(1, 60),
});
