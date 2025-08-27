import { useEffect, useState } from 'react';
import { Plus, FileText, Edit3, Search } from 'lucide-react';
import { Note, CreateNoteRequest } from '../types';

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState<CreateNoteRequest>({ title: '', content: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });

      if (response.ok) {
        setNewNote({ title: '', content: '' });
        setShowCreateForm(false);
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const updateNote = async (note: Note) => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });

      if (response.ok) {
        setEditingNote(null);
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const extractLinks = (content: string) => {
    // Simple regex to find [[Note Title]] patterns
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const matches = content.match(linkRegex) || [];
    return matches.map(match => match.slice(2, -2));
  };

  const renderContent = (content: string) => {
    // Replace [[Note Title]] with clickable links using terminal colors
    return content.replace(/\[\[([^\]]+)\]\]/g, '<span class="text-term-accent underline cursor-pointer hover:text-term-text transition-colors">$1</span>');
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>, isEditing = false) => {
    const textarea = e.target;
    const content = textarea.value;
    const cursor = textarea.selectionStart;
    
    if (isEditing) {
      setEditingNote(prev => prev ? { ...prev, content } : null);
    } else {
      setNewNote({ ...newNote, content });
    }
    
    setCursorPosition(cursor);
    
    // Check if user is typing [[ for note linking
    const beforeCursor = content.substring(0, cursor);
    const lastBrackets = beforeCursor.lastIndexOf('[[');
    const lastCloseBrackets = beforeCursor.lastIndexOf(']]');
    
    if (lastBrackets > lastCloseBrackets && lastBrackets !== -1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const getSuggestions = () => {
    const content = editingNote?.content || newNote.content || '';
    const beforeCursor = content.substring(0, cursorPosition);
    const lastBrackets = beforeCursor.lastIndexOf('[[');
    const searchText = beforeCursor.substring(lastBrackets + 2).toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchText) &&
      note.title !== (editingNote?.title || newNote.title)
    ).slice(0, 5);
  };

  const insertSuggestion = (noteTitle: string, isEditing = false) => {
    const content = isEditing ? (editingNote?.content || '') : (newNote.content || '');
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const lastBrackets = beforeCursor.lastIndexOf('[[');
    
    const newContent = 
      beforeCursor.substring(0, lastBrackets) + 
      `[[${noteTitle}]]` + 
      afterCursor;
    
    if (isEditing) {
      setEditingNote(prev => prev ? { ...prev, content: newContent } : null);
    } else {
      setNewNote({ ...newNote, content: newContent });
    }
    
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="title-terminal">knowledge base</h1>
          <p className="subtitle-terminal">
            your personal wiki with bi-directional linking
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          new note
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-term-text-dim" />
          <input
            type="text"
            placeholder="search notes..."
            className="input-cyber w-full pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-term-accent font-mono">{notes.length}</div>
          <div className="text-sm text-term-text-dim font-mono">total notes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-term-accent font-mono">
            {notes.reduce((acc, note) => acc + extractLinks(note.content).length, 0)}
          </div>
          <div className="text-sm text-term-text-dim font-mono">links created</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-term-accent font-mono">
            {notes.filter(note => note.content.trim().length > 0).length}
          </div>
          <div className="text-sm text-term-text-dim font-mono">notes with content</div>
        </div>
      </div>

      {/* Create Note Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-lg font-mono text-term-text mb-4">create new note</h2>
          <form onSubmit={createNote} className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-term-text mb-2">title</label>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="input-cyber w-full"
                placeholder="enter note title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-term-text mb-2">
                content
              </label>
              <div className="mb-2 text-xs font-mono text-term-text-dim">
                💡 tip: use [[note title]] to link to other notes - auto-complete available!
              </div>
              <div className="relative">
                <textarea
                  value={newNote.content}
                  onChange={(e) => handleContentChange(e)}
                  className="input-cyber w-full"
                  placeholder="write your note content here... try typing [[ to see note suggestions"
                  rows={6}
                />
                {showSuggestions && !editingNote && getSuggestions().length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-term-bg border border-term-border rounded-lg shadow-lg">
                    {getSuggestions().map((note) => (
                      <button
                        key={note.id}
                        onClick={() => insertSuggestion(note.title)}
                        className="w-full text-left px-3 py-2 font-mono text-sm text-term-text hover:bg-term-bg-alt hover:text-term-accent transition-colors border-b border-term-border last:border-b-0"
                      >
                        {note.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">create note</button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Note Form */}
      {editingNote && (
        <div className="card">
          <h2 className="text-lg font-mono text-term-text mb-4">edit note</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-term-text mb-2">title</label>
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="input-cyber w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-term-text mb-2">content</label>
              <div className="mb-2 text-xs font-mono text-term-text-dim">
                💡 tip: use [[note title]] to link to other notes - auto-complete available!
              </div>
              <div className="relative">
                <textarea
                  value={editingNote.content}
                  onChange={(e) => handleContentChange(e, true)}
                  className="input-cyber w-full"
                  rows={8}
                />
                {showSuggestions && editingNote && getSuggestions().length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-term-bg border border-term-border rounded-lg shadow-lg">
                    {getSuggestions().map((note) => (
                      <button
                        key={note.id}
                        onClick={() => insertSuggestion(note.title, true)}
                        className="w-full text-left px-3 py-2 font-mono text-sm text-term-text hover:bg-term-bg-alt hover:text-term-accent transition-colors border-b border-term-border last:border-b-0"
                      >
                        {note.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateNote(editingNote)}
                className="btn-primary"
              >
                save changes
              </button>
              <button
                onClick={() => setEditingNote(null)}
                className="btn-secondary"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-term-border rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-term-border rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-term-border rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <div key={note.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-term-accent" />
                  <h3 className="font-mono text-term-text ml-2">{note.title}</h3>
                </div>
                <button
                  onClick={() => setEditingNote(note)}
                  className="text-term-text-dim hover:text-term-text transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              
              <div
                className="text-sm text-term-text-dim mb-4 line-clamp-4 font-mono"
                dangerouslySetInnerHTML={{ __html: renderContent(note.content) }}
              />
              
              {extractLinks(note.content).length > 0 && (
                <div className="border-t border-term-border pt-3">
                  <div className="text-xs text-term-text-dim font-mono mb-1">links:</div>
                  <div className="flex flex-wrap gap-1">
                    {extractLinks(note.content).map((link, index) => (
                      <span key={index} className="text-xs bg-term-bg border border-term-accent text-term-accent px-2 py-1 rounded font-mono">
                        {link}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredNotes.length === 0 && !loading && (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 text-term-text-dim mx-auto mb-4" />
          {searchTerm ? (
            <div className="space-y-2">
              <p className="text-term-text-dim font-mono">no notes found matching your search</p>
              <p className="text-xs text-term-text-dim font-mono">try a different search term</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-term-text-dim font-mono">no notes yet</p>
              <div className="space-y-2">
                <p className="text-sm text-term-text font-mono">get started with your knowledge base:</p>
                <div className="space-y-1 text-xs text-term-text-dim font-mono">
                  <p>• click "new note" to create your first note</p>
                  <p>• use [[note title]] syntax to link notes together</p>
                  <p>• link notes to tasks from the tasks page</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary mt-4"
              >
                create first note
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}