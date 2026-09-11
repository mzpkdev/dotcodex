import { defineOption } from 'cmdore';

import { integer } from './integer.ts';

export const readLimit = defineOption({
  name: 'limit',
  description: 'Characters to show (1–12000).',
  arity: 1,
  defaultValue: () => 12000,
  coerce: integer(1, 12_000),
});
