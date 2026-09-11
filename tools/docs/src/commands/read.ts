import { CmdoreError, defineCommand, effect } from 'cmdore';

import { sectionId, url } from '../arguments/index.ts';
import type { ParsedDocument } from '../document.ts';
import { loadDocument } from '../fetch.ts';
import { MAX_TITLE_LENGTH, MAX_URL_LENGTH, output, page, truncate } from '../output.ts';
import { offset, readLimit, refresh } from '../options/index.ts';
import { formatTree, treeResult } from './tree.ts';

const readSection = (
  document: ParsedDocument,
  sourceUrl: string,
  id: string,
  characterOffset: number,
  limit: number,
): void => {
  const found = document.sections.find((entry) => entry.id === id);
  if (found === undefined) {
    throw new CmdoreError(`No section or link with ID "${id}" exists in ${sourceUrl}.`, {
      exitCode: 2,
    });
  }
  const section = found;

  const content = section.content;
  const resultPage = page(characterOffset, limit, content.length);
  const excerpt = content.slice(characterOffset, characterOffset + limit);
  const title = truncate(section.title, MAX_TITLE_LENGTH);
  const url = truncate(sourceUrl, MAX_URL_LENGTH);
  const data = {
    command: 'read' as const,
    url: url.value,
    section: { id: section.id, title: title.value, level: section.level },
    content: excerpt,
    page: resultPage,
    ...(title.truncated || url.truncated ? { truncated: true as const } : {}),
  };
  const text = [
    `${title.value} (${section.id})`,
    excerpt || '(end of section)',
    ...(resultPage.nextOffset === null
      ? []
      : [`\nMore content: --offset ${resultPage.nextOffset} --limit ${resultPage.limit}`]),
  ].join('\n\n');

  output(data, text);
};

export const read = async (
  sourceUrl: string,
  id: string,
  options: { refresh: boolean; offset: number; limit: number },
): Promise<void> => {
  if (!effect.enabled) {
    output(
      { command: 'read', dryRun: true, url: sourceUrl, sectionId: id, ...options },
      `Would load ${sourceUrl} and read ${id}.`,
    );
    return;
  }

  const document = await loadDocument(sourceUrl, { refresh: options.refresh });
  const link = document.links.find((entry) => entry.id === id);

  if (link !== undefined) {
    const target = await loadDocument(link.url, { refresh: options.refresh });
    const result = treeResult(target, link.url, options.offset, Math.min(options.limit, 60));
    const source = truncate(sourceUrl, MAX_URL_LENGTH);
    const title = truncate(link.title, MAX_TITLE_LENGTH);
    const targetUrl = truncate(link.url, MAX_URL_LENGTH);
    const data = {
      command: 'read' as const,
      url: source.value,
      link: { id: link.id, title: title.value, url: targetUrl.value },
      target: result,
      ...(source.truncated || title.truncated || targetUrl.truncated
        ? { truncated: true as const }
        : {}),
    };
    output(
      data,
      formatTree(
        result,
        `Loaded ${targetUrl.value}. Run docs tree ${targetUrl.value} to browse it later.\n`,
      ),
    );
    return;
  }

  readSection(document, sourceUrl, id, options.offset, options.limit);
};

export default defineCommand({
  name: 'read',
  description: 'Read one section, or open a linked page as a tree.',
  arguments: [url, sectionId],
  options: [refresh, offset, readLimit],
  run: ({
    url: sourceUrl,
    'section-id': id,
    refresh: shouldRefresh,
    offset: characterOffset,
    limit,
  }) => read(sourceUrl, id, { refresh: shouldRefresh, offset: characterOffset, limit }),
});
