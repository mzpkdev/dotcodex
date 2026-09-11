import { describe, expect, it } from 'webanvil/test';

import { parseDocument, searchDocument } from '../src/document.ts';

describe('parseDocument', () => {
  it('omits same-page heading anchors from linked pages', () => {
    const doc = parseDocument(
      '## [](#anatomy)Anatomy\n\n[Jump](https://docs.example.com/#anatomy)',
      'https://docs.example.com/',
    );
    expect(doc.sections[1].id).toBe('anatomy');
    expect(doc.links).toEqual([]);
  });

  it('ignores fenced-code headings and links while keeping real Markdown structure', () => {
    const doc = parseDocument(
      [
        'Preamble with [guide](./guide.md?view=full#intro).',
        '',
        '# Real heading',
        '',
        '```md',
        '# Not a heading',
        '[Not a link](https://ignored.example)',
        '```',
        '',
        'A [nested **link label**](../api?tab=one#method).',
      ].join('\n'),
      'https://docs.example.com/reference/page.md',
    );

    expect(doc.sections).toEqual([
      {
        id: 'root',
        title: 'Overview',
        level: 0,
        content: 'Preamble with [guide](./guide.md?view=full#intro).',
      },
      {
        id: 'real-heading',
        title: 'Real heading',
        level: 1,
        parentId: 'root',
        content:
          '```md\n# Not a heading\n[Not a link](https://ignored.example)\n```\n\nA [nested **link label**](../api?tab=one#method).',
      },
    ]);
    expect(doc.links).toEqual([
      {
        id: expect.stringMatching(/^link-[0-9a-f]{16}$/),
        title: 'guide',
        url: 'https://docs.example.com/reference/guide.md?view=full#intro',
        parentId: 'root',
      },
      {
        id: expect.stringMatching(/^link-[0-9a-f]{16}$/),
        title: 'nested link label',
        url: 'https://docs.example.com/api?tab=one#method',
        parentId: 'real-heading',
      },
    ]);
  });

  it('parses setext headings, keeps direct content out of child sections, and gives collisions unique IDs', () => {
    const doc = parseDocument(
      ['A', '=', 'Parent only.', '', 'A 2', '---', 'Child only.', '', '# A', 'Sibling only.'].join(
        '\n',
      ),
      'https://docs.example.com/manual',
    );

    expect(
      doc.sections.map(({ id, title, level, parentId, content }) => ({
        id,
        title,
        level,
        parentId,
        content,
      })),
    ).toEqual([
      { id: 'root', title: 'Overview', level: 0, content: '' },
      { id: 'a', title: 'A', level: 1, parentId: 'root', content: 'Parent only.' },
      { id: 'a-2', title: 'A 2', level: 2, parentId: 'a', content: 'Child only.' },
      { id: 'a-3', title: 'A', level: 1, parentId: 'root', content: 'Sibling only.' },
    ]);
    expect(doc.sections[1].content).not.toContain('Child only.');
  });

  it('caps long generated section IDs before assigning a duplicate suffix', () => {
    const title = 'a'.repeat(100);
    const doc = parseDocument(`# ${title}\n\n# ${title}`, 'https://docs.example.com/manual');

    expect(doc.sections[1].id).toHaveLength(80);
    expect(doc.sections[2].id).toHaveLength(80);
    expect(doc.sections[2].id).toMatch(/-2$/);
  });

  it('deduplicates resolved HTTP links and omits images and non-HTTP targets', () => {
    const doc = parseDocument(
      [
        '[One](./same)',
        '[Two](./same)',
        '![Image](https://docs.example.com/image.png)',
        '[Email](mailto:hi@example.com)',
        '[Script](javascript:alert(1))',
      ].join('\n'),
      'https://docs.example.com/guide/index.md',
    );

    expect(doc.links).toEqual([
      {
        id: expect.stringMatching(/^link-[0-9a-f]{16}$/),
        title: 'One',
        url: 'https://docs.example.com/guide/same',
        parentId: 'root',
      },
    ]);
  });
});

describe('searchDocument', () => {
  it('matches simple plurals without removing the singular trailing e', () => {
    const doc = parseDocument('# State value\n\nReactive data.', 'https://docs.example.com');
    expect(searchDocument(doc, 'states values', 1)[0]?.id).toBe('state-value');
  });

  it('ranks title and repeated direct-content keyword matches above a large unrelated section', () => {
    const doc = parseDocument(
      [
        '# General notes',
        '',
        'filler '.repeat(500),
        '',
        '# Class state',
        '',
        'Use class state when state needs coordinated actions. Class state is reactive.',
        '',
        '# Other',
        '',
        'State appears once.',
      ].join('\n'),
      'https://docs.example.com/svelte',
    );

    const results = searchDocument(doc, 'class state');

    expect(results[0]).toMatchObject({
      id: 'class-state',
      title: 'Class state',
      kind: 'section',
    });
    expect(results[0].snippet.length).toBeLessThanOrEqual(180);
    expect(searchDocument(doc, 'state', 1)).toHaveLength(1);
    expect(() => searchDocument(doc, '   ')).toThrow('Search query must not be empty.');
  });

  it('prefers a relevant heading and its ancestors over repeated body text and HTML attributes', () => {
    const doc = parseDocument(
      [
        '# $state',
        '',
        '### Classes',
        '',
        'State in classes has coordinated behavior.',
        '',
        '# CompileOptions',
        '',
        '<div class="class state">ignored attributes</div>',
        'class state '.repeat(1_000),
      ].join('\n'),
      'https://docs.example.com/svelte',
    );

    expect(searchDocument(doc, 'class state', 1)[0]).toMatchObject({
      id: 'classes',
      title: '$state › Classes',
      kind: 'section',
    });
  });

  it('prefers links whose titles cover every query term', () => {
    const doc = parseDocument(
      [
        '# Components',
        '',
        'Svelte Dialog '.repeat(1_000),
        '',
        '[Svelte: Dialog](https://ark-ui.com/docs/components/dialog)',
      ].join('\n'),
      'https://ark-ui.com/llms.txt',
    );

    expect(searchDocument(doc, 'Svelte Dialog', 1)[0]).toMatchObject({
      kind: 'link',
      title: 'Svelte: Dialog',
    });
  });
});
