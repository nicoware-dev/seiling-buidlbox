/** Note list component */

import { useState } from "react";
import { useDeleteNote, useNotes } from "../hooks/useNotes";
import { Note } from "../services/api";
import NoteEditor from "./NoteEditor";

export default function NoteList() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notes = [], isLoading, error } = useNotes();
  const deleteNote = useDeleteNote();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote.mutateAsync(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span>Loading notes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/40 rounded-lg">
        <div className="text-red-800 dark:text-red-300 font-medium mb-1">Error loading notes</div>
        <div className="text-red-600 dark:text-red-200 text-sm">{String(error)}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Notes sidebar */}
      <div className="w-1/3 border-r dark:border-gray-700 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Notes</h2>
          <button
            onClick={() => setSelectedNote(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Note
          </button>
        </div>

        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#23272f] text-[var(--text)] rounded"
        />

        {filteredNotes.length === 0 ? (
          <div className="text-gray-500">No notes found</div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 border dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2b3342] ${
                  selectedNote?.id === note.id ? "bg-blue-50 dark:bg-[#1f3c66] border-blue-300 dark:border-blue-400" : ""
                }`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="font-medium">{note.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {note.body.substring(0, 100)}
                  {note.body.length > 100 ? "..." : ""}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                  className="mt-2 text-xs text-red-600 dark:text-red-300 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note editor */}
      <div className="flex-1 p-4">
        <NoteEditor
          note={selectedNote}
          onNoteSaved={(note) => setSelectedNote(note)}
        />
      </div>
    </div>
  );
}

