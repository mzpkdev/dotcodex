import { defineArgument } from 'cmdore';

const nonEmpty = (value: string, name: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) throw new Error(`${name} cannot be empty.`);
  return trimmed;
};

export const query = defineArgument({
  name: 'query',
  description: 'Words to search for.',
  required: true,
  coerce: (value) => nonEmpty(value, 'query'),
});
