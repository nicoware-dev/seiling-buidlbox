/** React Query hooks for notes */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  CreateNoteRequest,
  UpdateNoteRequest,
} from "../services/api";

// Query keys
export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
};

// Hooks
export function useNotes() {
  return useQuery({
    queryKey: noteKeys.lists(),
    queryFn: () => api.getNotes(),
    select: (data) => data.notes,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => api.getNote(id),
    select: (data) => data.note,
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteRequest) => api.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteRequest }) =>
      api.updateNote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      queryClient.invalidateQueries({
        queryKey: noteKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

