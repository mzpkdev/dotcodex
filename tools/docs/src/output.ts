import { terminal } from 'cmdore';

export const MAX_TITLE_LENGTH = 200;
export const MAX_URL_LENGTH = 2_000;
export const MAX_SNIPPET_LENGTH = 800;

export type Page = {
  offset: number;
  limit: number;
  total: number;
  nextOffset: number | null;
};

export const page = (offset: number, limit: number, total: number): Page => ({
  offset,
  limit,
  total,
  nextOffset: offset + limit < total ? offset + limit : null,
});

export const truncate = (value: string, maximum: number): { value: string; truncated: boolean } => {
  if (value.length <= maximum) return { value, truncated: false };
  return { value: `${value.slice(0, Math.max(0, maximum - 1))}…`, truncated: true };
};

export const output = (data: unknown, text: string): void => {
  if (terminal.jsonMode) {
    terminal.json(data);
    return;
  }

  terminal.log(text);
};

export const dryRun = (command: string, details: Record<string, unknown>): void => {
  output(
    { command, dryRun: true, ...details },
    `Would run docs ${command} ${Object.values(details).join(' ')}`,
  );
};
