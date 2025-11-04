/** React Query hooks for artifacts */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  CreateArtifactRequest,
  UpdateArtifactRequest,
} from "../services/api";

// Query keys
export const artifactKeys = {
  all: ["artifacts"] as const,
  lists: () => [...artifactKeys.all, "list"] as const,
  list: (type?: string) => [...artifactKeys.lists(), type] as const,
  details: () => [...artifactKeys.all, "detail"] as const,
  detail: (id: string) => [...artifactKeys.details(), id] as const,
};

// Hooks
export function useArtifacts(type?: string) {
  return useQuery({
    queryKey: artifactKeys.list(type),
    queryFn: () => api.getArtifacts(type),
    select: (data) => data.artifacts,
  });
}

export function useArtifact(id: string) {
  return useQuery({
    queryKey: artifactKeys.detail(id),
    queryFn: () => api.getArtifact(id),
    select: (data) => data.artifact,
    enabled: !!id,
  });
}

export function useCreateArtifact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArtifactRequest) => api.createArtifact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artifactKeys.all });
    },
  });
}

export function useUpdateArtifact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArtifactRequest }) =>
      api.updateArtifact(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: artifactKeys.all });
      queryClient.invalidateQueries({
        queryKey: artifactKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteArtifact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteArtifact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artifactKeys.all });
    },
  });
}

