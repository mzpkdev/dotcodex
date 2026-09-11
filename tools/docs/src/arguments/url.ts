import { defineArgument } from 'cmdore';

const httpUrl = (value: string): string => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error('url must be an absolute http(s) URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('url must use http or https.');
  }

  return value;
};

export const url = defineArgument({
  name: 'url',
  description: 'Documentation URL or llms.txt URL.',
  required: true,
  coerce: httpUrl,
});
