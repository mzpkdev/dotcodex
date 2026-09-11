import { defineArgument } from 'cmdore';

export const sectionId = defineArgument({
  name: 'section-id',
  description: 'Section or link ID from tree or search.',
  required: true,
  coerce: (value) => {
    const id = value.trim();
    if (id.length === 0) throw new Error('section-id cannot be empty.');
    return id;
  },
});
