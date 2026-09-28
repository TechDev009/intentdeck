export const MIN_JEV_PROMPT_CHARACTERS = 20

export function countJevPromptCharacters(text: string): number {
  return [...text.trim()].length
}
