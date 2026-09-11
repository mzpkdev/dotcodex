import { defineOption } from 'cmdore';

export const refresh = defineOption({
  name: 'refresh',
  description: 'Refresh the cached source before reading it.',
  arity: 0,
});
