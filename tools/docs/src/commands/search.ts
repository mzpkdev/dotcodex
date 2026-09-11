import { defineCommand, effect } from 'cmdore';

import { query, url } from '../arguments/index.ts';
import { searchDocument } from '../document.ts';
import { loadDocument } from '../fetch.ts';
import {
  MAX_SNIPPET_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_URL_LENGTH,
  output,
  truncate,
} from '../output.ts';
import { refresh, searchLimit } from '../options/index.ts';

export const search = async (
  sourceUrl: string,
  terms: string,
  options: { refresh: boolean; limit: number },
): Promise<void> => {
  if (!effect.enabled) {
    output(
      { command: 'search', dryRun: true, url: sourceUrl, query: terms, ...options },
      `Would load ${sourceUrl} and search for ${JSON.stringify(terms)}.`,
    );
    return;
  }

  const document = await loadDocument(sourceUrl, { refresh: options.refresh });
  const results = searchDocument(document, terms, options.limit);
  const source = truncate(sourceUrl, MAX_URL_LENGTH);
  const bounded = results.map((result) => {
    const title = truncate(result.title, MAX_TITLE_LENGTH);
    const snippet = truncate(result.snippet, MAX_SNIPPET_LENGTH);
    const url = result.url === undefined ? undefined : truncate(result.url, MAX_URL_LENGTH);

    return {
      id: result.id,
      title: title.value,
      kind: result.kind,
      score: result.score,
      snippet: snippet.value,
      ...(url === undefined ? {} : { url: url.value }),
      ...(title.truncated || snippet.truncated || url?.truncated
        ? { truncated: true as const }
        : {}),
    };
  });
  const data = { command: 'search', url: source.value, query: terms, results: bounded };
  const text = [
    `${source.value}\n`,
    ...bounded.map((result) => {
      const target = result.url === undefined ? '' : ` → ${result.url}`;
      return `${result.id}  ${result.title}${target}\n  ${result.snippet}`;
    }),
    ...(results.length === 0 ? ['No matching sections or links.'] : []),
  ].join('\n');

  output(data, text);
};

export default defineCommand({
  name: 'search',
  description: 'Find relevant sections without crawling linked pages.',
  arguments: [url, query],
  options: [refresh, searchLimit],
  run: ({ url: sourceUrl, query: terms, refresh: shouldRefresh, limit }) =>
    search(sourceUrl, terms, { refresh: shouldRefresh, limit }),
});
