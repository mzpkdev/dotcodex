import { describe, describe as context, expect, it } from 'webanvil/test';

import { parseDocument, searchDocument } from '../src/document.ts';

describe('document parsing', () => {
  context('with an anchor that only points within the current page', () => {
    it('omits the anchor from linked pages', () => {
      const doc = parseDocument(
        '## [](#anatomy)Anatomy\n\n[Jump](https://docs.example.com/#anatomy)',
        'https://docs.example.com/',
      );
      expect(doc.sections[1].id).toBe('anatomy');
      expect(doc.links).toEqual([]);
    });
  });

  context('with Markdown structure', () => {
    it('keeps real headings and links while ignoring fenced code', () => {
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

    it('assigns direct content to the section that contains it', () => {
      const doc = parseDocument(
        [
          'A',
          '=',
          'Parent only.',
          '',
          'A 2',
          '---',
          'Child only.',
          '',
          '# A',
          'Sibling only.',
        ].join('\n'),
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
  });

  context('with duplicate headings whose generated ID reaches the limit', () => {
    it('reserves space for a unique suffix', () => {
      const title = 'a'.repeat(100);
      const doc = parseDocument(`# ${title}\n\n# ${title}`, 'https://docs.example.com/manual');

      expect(doc.sections[1].id).toHaveLength(80);
      expect(doc.sections[2].id).toHaveLength(80);
      expect(doc.sections[2].id).toMatch(/-2$/);
    });
  });

  context('with repeated and unsupported link targets', () => {
    it('keeps each resolved HTTP page once', () => {
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
});

describe('document search', () => {
  context('with simple plurals', () => {
    it('matches singular terms ending in e', () => {
      const doc = parseDocument('# State value\n\nReactive data.', 'https://docs.example.com');
      expect(searchDocument(doc, 'states values', 1)[0]?.id).toBe('state-value');
    });
  });

  context('with a title and repeated direct-content matches', () => {
    it('ranks the relevant section over large unrelated content', () => {
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
    });

    it('honors the requested result limit', () => {
      const doc = parseDocument('# State\n\nReactive data.', 'https://docs.example.com');
      expect(searchDocument(doc, 'state', 1)).toHaveLength(1);
    });
  });

  context('with an empty query', () => {
    it('rejects whitespace-only input', () => {
      const doc = parseDocument('# State\n\nReactive data.', 'https://docs.example.com');
      expect(() => searchDocument(doc, '   ')).toThrow('Search query must not be empty.');
    });
  });

  context('when headings provide a closer match than body text', () => {
    it('prefers the heading and includes its ancestry', () => {
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
  });

  context('when a link title covers every query term', () => {
    it('ranks the link above repeated section content', () => {
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
});
