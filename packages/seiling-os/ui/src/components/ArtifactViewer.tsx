/** Artifact viewer/editor component */

import { useState, useEffect } from "react";
import { useCreateArtifact, useUpdateArtifact } from "../hooks/useArtifacts";
import { Artifact } from "../services/api";

const ARTIFACT_TYPES = ["prompt", "rule", "context", "config", "other"];

interface ArtifactViewerProps {
  artifact: Artifact | null;
  onArtifactSaved: (artifact: Artifact) => void;
}

export default function ArtifactViewer({
  artifact,
  onArtifactSaved,
}: ArtifactViewerProps) {
  const [name, setName] = useState(artifact?.name || "");
  const [type, setType] = useState(artifact?.type || "prompt");
  const [content, setContent] = useState(artifact?.content || "");

  const createArtifact = useCreateArtifact();
  const updateArtifact = useUpdateArtifact();

  useEffect(() => {
    if (artifact) {
      setName(artifact.name);
      setType(artifact.type);
      setContent(artifact.content);
    } else {
      setName("");
      setType("prompt");
      setContent("");
    }
  }, [artifact]);

  const handleSave = async () => {
    if (!name.trim() || !type.trim()) {
      return;
    }

    try {
      if (artifact) {
        const result = await updateArtifact.mutateAsync({
          id: artifact.id,
          data: { name, type, content },
        });
        onArtifactSaved(result.artifact);
      } else {
        const result = await createArtifact.mutateAsync({ name, type, content });
        onArtifactSaved(result.artifact);
      }
    } catch (error) {
      // Error will be handled by React Query's onError
      console.error("Error saving artifact:", error);
    }
  };

  if (!artifact && !name && !content) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No artifact selected</p>
          <p>Create a new artifact or select one from the list</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {artifact ? "Edit Artifact" : "New Artifact"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              createArtifact.isPending ||
              updateArtifact.isPending ||
              name.trim() === "" ||
              type.trim() === ""
            }
          >
            {createArtifact.isPending || updateArtifact.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
        {(createArtifact.isError || updateArtifact.isError) && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/40 rounded text-red-600 dark:text-red-200 text-sm">
            {String(createArtifact.error || updateArtifact.error)}
          </div>
        )}
      </div>

      <div className="flex-1 border dark:border-gray-700 rounded overflow-hidden flex flex-col bg-white dark:bg-[#23272f]">
        <div className="p-4 border-b dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Artifact name..."
              className={`w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded focus:outline-none focus:ring-2 ${
                name.trim() === "" && createArtifact.isError
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
            />
            {name.trim() === "" && (
              <p className="text-xs text-red-600 mt-1">Name is required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ARTIFACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-medium p-4 pb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Artifact content..."
            className="flex-1 px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-white dark:bg-[#1e2633] text-[var(--text)] border-t dark:border-gray-700"
          />
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-[#2b3342] rounded text-sm text-gray-600 dark:text-gray-300">
        <p className="font-medium mb-1">Artifact Types:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Prompt:</strong> AI prompts and instructions</li>
          <li><strong>Rule:</strong> Coding rules and guidelines</li>
          <li><strong>Context:</strong> Context files and documentation</li>
          <li><strong>Config:</strong> Configuration templates</li>
          <li><strong>Other:</strong> Other artifact types</li>
        </ul>
      </div>
    </div>
  );
}

