/** Note editor component with markdown support */

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useCreateNote, useUpdateNote } from "../hooks/useNotes";
import { Note } from "../services/api";

interface NoteEditorProps {
  note: Note | null;
  onNoteSaved: (note: Note) => void;
}

export default function NoteEditor({ note, onNoteSaved }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [body, setBody] = useState(note?.body || "");
  const [preview, setPreview] = useState(false);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
    } else {
      setTitle("");
      setBody("");
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    try {
      if (note) {
        const result = await updateNote.mutateAsync({
          id: note.id,
          data: { title, body },
        });
        onNoteSaved(result.note);
      } else {
        const result = await createNote.mutateAsync({ title, body });
        onNoteSaved(result.note);
      }
    } catch (error) {
      // Error will be handled by React Query's onError
      console.error("Error saving note:", error);
    }
  };

  if (!note && !title && !body) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No note selected</p>
          <p>Create a new note or select one from the list</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {note ? "Edit Note" : "New Note"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="px-4 py-2 border dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-[#2b3342]"
          >
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              createNote.isPending ||
              updateNote.isPending ||
              title.trim() === ""
            }
          >
            {createNote.isPending || updateNote.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
        {(createNote.isError || updateNote.isError) && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/40 rounded text-red-600 dark:text-red-200 text-sm">
            {String(createNote.error || updateNote.error)}
          </div>
        )}
      </div>

      <div className="flex-1 border dark:border-gray-700 rounded overflow-hidden bg-white dark:bg-[#23272f]">
        {preview ? (
          <div className="p-4 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            <ReactMarkdown>{body || "*No content*"}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col h-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className={`px-4 py-2 border-b dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] font-medium text-lg focus:outline-none focus:ring-2 ${
              title.trim() === "" && createNote.isError
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-blue-500"
            }`}
          />
          {title.trim() === "" && (
            <p className="text-xs text-red-600 px-4 mt-1">Title is required</p>
          )}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your note in Markdown..."
              className="flex-1 px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#1e2633] text-[var(--text)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

