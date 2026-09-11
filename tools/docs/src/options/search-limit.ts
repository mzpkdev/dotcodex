import { defineOption } from 'cmdore';

import { integer } from './integer.ts';

export const searchLimit = defineOption({
  name: 'limit',
  description: 'Results to show (1–100).',
  arity: 1,
  defaultValue: () => 10,
  coerce: integer(1, 100),
});
