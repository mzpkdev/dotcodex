import { defineOption } from 'cmdore';

import { integer } from './integer.ts';

export const offset = defineOption({
  name: 'offset',
  description: 'Zero-based result offset.',
  arity: 1,
  defaultValue: () => 0,
  coerce: integer(0, Number.MAX_SAFE_INTEGER),
});
