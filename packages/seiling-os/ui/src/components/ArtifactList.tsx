/** Artifact list component */

import { useState } from "react";
import { useDeleteArtifact, useArtifacts } from "../hooks/useArtifacts";
import { Artifact } from "../services/api";
import ArtifactViewer from "./ArtifactViewer";

const ARTIFACT_TYPES = ["prompt", "rule", "context", "config", "other"];

export default function ArtifactList() {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: artifacts = [], isLoading, error } = useArtifacts(
    filterType !== "all" ? filterType : undefined
  );
  const deleteArtifact = useDeleteArtifact();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this artifact?")) {
      await deleteArtifact.mutateAsync(id);
      if (selectedArtifact?.id === id) {
        setSelectedArtifact(null);
      }
    }
  };

  const filteredArtifacts = artifacts.filter(
    (artifact) =>
      artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span>Loading artifacts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/40 rounded-lg">
        <div className="text-red-800 dark:text-red-300 font-medium mb-1">Error loading artifacts</div>
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
      {/* Artifacts sidebar */}
      <div className="w-1/3 border-r dark:border-gray-700 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Artifacts</h2>
          <button
            onClick={() => setSelectedArtifact(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Artifact
          </button>
        </div>

        {/* Type filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#23272f] text-[var(--text)] rounded"
          >
            <option value="all">All Types</option>
            {ARTIFACT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search artifacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#23272f] text-[var(--text)] rounded"
        />

        {/* Artifact list */}
        {filteredArtifacts.length === 0 ? (
          <div className="text-gray-500">No artifacts found</div>
        ) : (
          <div className="space-y-2">
            {filteredArtifacts.map((artifact) => (
              <div
                key={artifact.id}
                className={`p-3 border dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2b3342] ${
                  selectedArtifact?.id === artifact.id
                    ? "bg-blue-50 dark:bg-[#1f3c66] border-blue-300 dark:border-blue-400"
                    : ""
                }`}
                onClick={() => setSelectedArtifact(artifact)}
              >
                <div className="font-medium">{artifact.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Type: {artifact.type}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {artifact.content.substring(0, 100)}
                  {artifact.content.length > 100 ? "..." : ""}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(artifact.id);
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

      {/* Artifact viewer/editor */}
      <div className="flex-1 p-4">
        <ArtifactViewer
          artifact={selectedArtifact}
          onArtifactSaved={(artifact) => setSelectedArtifact(artifact)}
        />
      </div>
    </div>
  );
}

