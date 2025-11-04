/** API client for Seiling OS */

import { API_BASE_URL } from "../config";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  done?: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  done?: boolean;
}

export interface CreateNoteRequest {
  title: string;
  body?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  body?: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateArtifactRequest {
  name: string;
  type: string;
  content?: string;
}

export interface UpdateArtifactRequest {
  name?: string;
  type?: string;
  content?: string;
}

export interface KnowledgeSearchResult {
  content: string;
  score: number;
  metadata: Record<string, any>;
  chunk_id: string;
}

export interface CrawlRequest {
  url: string;
  max_pages?: number;
}

export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface Execution {
  id: string;
  execution_type: string;
  name: string;
  status: string;
  input_data: Record<string, any> | null;
  output_data: Record<string, any> | null;
  error_message: string | null;
  task_id: string | null;
  created_at: string | null;
}

export interface ExecuteN8NRequest {
  workflow_id: string;
  input_data?: Record<string, any>;
}

export interface ExecuteFlowiseRequest {
  agent_id: string;
  input_data?: Record<string, any>;
}

export interface ExecuteMCPRequest {
  tool_name: string;
  input_data?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            // FastAPI error format: { detail: { error: "message" } }
            if (typeof errorData.detail === "string") {
              errorMessage = errorData.detail;
            } else if (errorData.detail.error) {
              errorMessage = errorData.detail.error;
            } else if (errorData.detail.message) {
              errorMessage = errorData.detail.message;
            }
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If JSON parsing fails, use default error message
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // Network errors or other fetch errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Could not connect to server. Please ensure the server is running."
        );
      }
      // Re-throw other errors (including our custom Error)
      throw error;
    }
  }

  // Tasks API
  async getTasks(done?: boolean): Promise<{ tasks: Task[] }> {
    const params = done !== undefined ? `?done=${done}` : "";
    return this.request<{ tasks: Task[] }>(`/api/tasks${params}`);
  }

  async getTask(id: string): Promise<{ task: Task }> {
    return this.request<{ task: Task }>(`/api/tasks/${id}`);
  }

  async createTask(data: CreateTaskRequest): Promise<{ task: Task }> {
    return this.request<{ task: Task }>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(
    id: string,
    data: UpdateTaskRequest
  ): Promise<{ task: Task }> {
    return this.request<{ task: Task }>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  }

  // Notes API
  async getNotes(): Promise<{ notes: Note[] }> {
    return this.request<{ notes: Note[] }>("/api/notes");
  }

  async getNote(id: string): Promise<{ note: Note }> {
    return this.request<{ note: Note }>(`/api/notes/${id}`);
  }

  async createNote(data: CreateNoteRequest): Promise<{ note: Note }> {
    return this.request<{ note: Note }>("/api/notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateNote(
    id: string,
    data: UpdateNoteRequest
  ): Promise<{ note: Note }> {
    return this.request<{ note: Note }>(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteNote(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/notes/${id}`, {
      method: "DELETE",
    });
  }

  // Artifacts API
  async getArtifacts(type?: string): Promise<{ artifacts: Artifact[] }> {
    const params = type ? `?type=${encodeURIComponent(type)}` : "";
    return this.request<{ artifacts: Artifact[] }>(`/api/artifacts${params}`);
  }

  async getArtifact(id: string): Promise<{ artifact: Artifact }> {
    return this.request<{ artifact: Artifact }>(`/api/artifacts/${id}`);
  }

  async createArtifact(data: CreateArtifactRequest): Promise<{ artifact: Artifact }> {
    return this.request<{ artifact: Artifact }>("/api/artifacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateArtifact(
    id: string,
    data: UpdateArtifactRequest
  ): Promise<{ artifact: Artifact }> {
    return this.request<{ artifact: Artifact }>(`/api/artifacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteArtifact(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/artifacts/${id}`, {
      method: "DELETE",
    });
  }

  // Knowledge Base API
  async crawlDocs(data: CrawlRequest): Promise<{
    message: string;
    source_id: string;
    pages_crawled: number;
    chunks_created: number;
  }> {
    return this.request("/api/knowledge/crawl", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async searchKnowledge(data: SearchRequest): Promise<{
    results: KnowledgeSearchResult[];
    query: string;
  }> {
    return this.request("/api/knowledge/search", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async indexChunks(chunk_ids: string[]): Promise<{
    message: string;
    chunks_indexed: number;
  }> {
    return this.request("/api/knowledge/index", {
      method: "POST",
      body: JSON.stringify(chunk_ids),
    });
  }

  // Run Panel API
  async executeN8N(data: ExecuteN8NRequest): Promise<{ execution: Execution }> {
    return this.request("/api/runs/n8n", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async executeFlowise(
    data: ExecuteFlowiseRequest
  ): Promise<{ execution: Execution }> {
    return this.request("/api/runs/flowise", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async executeMCP(data: ExecuteMCPRequest): Promise<{ execution: Execution }> {
    return this.request("/api/runs/mcp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getExecutionHistory(
    execution_type?: string,
    limit?: number
  ): Promise<{ executions: Execution[] }> {
    const params = new URLSearchParams();
    if (execution_type) params.append("execution_type", execution_type);
    if (limit) params.append("limit", limit.toString());
    const query = params.toString();
    return this.request<{ executions: Execution[] }>(
      `/api/runs/history${query ? `?${query}` : ""}`
    );
  }
}

export const api = new ApiClient(API_BASE_URL);
