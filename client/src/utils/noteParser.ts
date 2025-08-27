import { Note } from '../types';

export function parseNoteMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+(?:\s+[a-zA-Z0-9_-]+)*)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1].toLowerCase().replace(/\s+/g, '-'));
  }
  
  return [...new Set(mentions)]; // Remove duplicates
}

export async function fetchMentionedNotes(mentions: string[]): Promise<Note[]> {
  if (mentions.length === 0) return [];
  
  try {
    const response = await fetch('/api/notes');
    const allNotes: Note[] = await response.json();
    
    // Match notes by title (case-insensitive, handle spaces/hyphens)
    const matchedNotes = allNotes.filter(note => {
      const normalizedTitle = note.title.toLowerCase().replace(/\s+/g, '-');
      return mentions.includes(normalizedTitle);
    });
    
    return matchedNotes;
  } catch (error) {
    console.error('Error fetching mentioned notes:', error);
    return [];
  }
}

export function formatNotesForAI(notes: Note[]): string {
  if (notes.length === 0) return '';
  
  const contextHeader = '\n\nReferenced Notes Context:';
  const noteContexts = notes.map(note => 
    `\n--- ${note.title} ---\n${note.content}`
  ).join('\n');
  
  return `${contextHeader}${noteContexts}\n\nPlease consider this context when providing guidance.`;
}