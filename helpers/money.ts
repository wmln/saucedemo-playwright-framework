/** Extracts the dollar amount from text like "$29.99" or "Item total: $39.98". */
export function parseMoney(text: string): number {
  const match = text.match(/\$(\d+(?:\.\d+)?)/);

  if (!match) {
    throw new Error(`No dollar amount found in "${text}"`);
  }

  return Number(match[1]);
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
