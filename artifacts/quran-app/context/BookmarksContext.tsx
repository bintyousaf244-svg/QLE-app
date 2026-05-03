import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Bookmark, Note } from "@/types";

const BOOKMARKS_KEY = "@quranic_bookmarks";
const NOTES_KEY = "@quranic_notes";

interface BookmarksContextType {
  bookmarks: Bookmark[];
  notes: Note[];
  addBookmark: (b: Omit<Bookmark, "id" | "createdAt">) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (surah: number, ayah: number) => boolean;
  addNote: (n: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  getNoteForAyah: (surah: number, ayah: number) => Note | undefined;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(BOOKMARKS_KEY).then((v) => { if (v) { try { setBookmarks(JSON.parse(v)); } catch {} } });
    AsyncStorage.getItem(NOTES_KEY).then((v) => { if (v) { try { setNotes(JSON.parse(v)); } catch {} } });
  }, []);

  const saveBookmarks = (updated: Bookmark[]) => {
    setBookmarks(updated);
    AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  };

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  };

  const addBookmark = useCallback((b: Omit<Bookmark, "id" | "createdAt">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    saveBookmarks([{ ...b, id, createdAt: Date.now() }, ...bookmarks]);
  }, [bookmarks]);

  const removeBookmark = useCallback((id: string) => {
    saveBookmarks(bookmarks.filter((b) => b.id !== id));
  }, [bookmarks]);

  const isBookmarked = useCallback((surah: number, ayah: number) => {
    return bookmarks.some((b) => b.surahNumber === surah && b.ayahNumber === ayah);
  }, [bookmarks]);

  const addNote = useCallback((n: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = Date.now();
    const existing = notes.find((x) => x.surahNumber === n.surahNumber && x.ayahNumber === n.ayahNumber);
    if (existing) {
      saveNotes(notes.map((x) => x.id === existing.id ? { ...x, content: n.content, updatedAt: now } : x));
    } else {
      saveNotes([{ ...n, id, createdAt: now, updatedAt: now }, ...notes]);
    }
  }, [notes]);

  const updateNote = useCallback((id: string, content: string) => {
    saveNotes(notes.map((n) => n.id === id ? { ...n, content, updatedAt: Date.now() } : n));
  }, [notes]);

  const deleteNote = useCallback((id: string) => {
    saveNotes(notes.filter((n) => n.id !== id));
  }, [notes]);

  const getNoteForAyah = useCallback((surah: number, ayah: number) => {
    return notes.find((n) => n.surahNumber === surah && n.ayahNumber === ayah);
  }, [notes]);

  return (
    <BookmarksContext.Provider value={{
      bookmarks, notes, addBookmark, removeBookmark, isBookmarked,
      addNote, updateNote, deleteNote, getNoteForAyah,
    }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider");
  return ctx;
}
