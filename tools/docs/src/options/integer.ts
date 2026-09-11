import type { CoerceContext } from 'cmdore';

export const integer =
  (minimum: number, maximum: number) =>
  (value: string, context: CoerceContext): number => {
    if (!/^\d+$/.test(value)) {
      throw new Error(`${context.label} must be an integer from ${minimum} to ${maximum}.`);
    }

    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
      throw new Error(`${context.label} must be an integer from ${minimum} to ${maximum}.`);
    }

    return parsed;
  };
