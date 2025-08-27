import express from 'express';
import { db } from '../models/database.js';

const router = express.Router();

// Get all notes
router.get('/', (_, res) => {
  try {
    const notes = db.getNotes();
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note
router.get('/:id', (req, res) => {
  try {
    const note = db.getNote(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create note
router.post('/', (req, res) => {
  try {
    const { title, content = '' } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const note = db.createNote({ title, content });
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', (req, res) => {
  try {
    const { title, content } = req.body;
    
    const note = db.updateNote(req.params.id, { title, content });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', (req, res) => {
  try {
    const success = db.deleteNote(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;