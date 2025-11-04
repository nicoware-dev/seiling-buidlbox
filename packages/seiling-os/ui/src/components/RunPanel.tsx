/** Run panel component for n8n/Flowise/MCP execution */

import { useState, useEffect } from "react";
import { api, Execution } from "../services/api";

type ExecutionType = "n8n" | "flowise" | "mcp" | "all";

export default function RunPanel() {
  const [activeTab, setActiveTab] = useState<ExecutionType>("n8n");
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Execution form state
  const [workflowId, setWorkflowId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [toolName, setToolName] = useState("");
  const [inputData, setInputData] = useState("{}");
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    loadExecutions();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadExecutions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getExecutionHistory(
        activeTab === "all" ? undefined : activeTab,
        50
      );
      setExecutions(data.executions || []);
    } catch (error) {
      console.error("Error loading executions:", error);
      setExecutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteN8N = async () => {
    if (!workflowId.trim()) {
      alert("Workflow ID is required");
      return;
    }

    setIsExecuting(true);
    try {
      let input = {};
      try {
        input = JSON.parse(inputData);
      } catch {
        // Use empty object if invalid JSON
      }

      await api.executeN8N({ workflow_id: workflowId, input_data: input });
      setWorkflowId("");
      setInputData("{}");
      await loadExecutions();
    } catch (error) {
      alert(`Error executing workflow: ${String(error)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteFlowise = async () => {
    if (!agentId.trim()) {
      alert("Agent ID is required");
      return;
    }

    setIsExecuting(true);
    try {
      let input = {};
      try {
        input = JSON.parse(inputData);
      } catch {
        // Use empty object if invalid JSON
      }

      await api.executeFlowise({ agent_id: agentId, input_data: input });
      setAgentId("");
      setInputData("{}");
      await loadExecutions();
    } catch (error) {
      alert(`Error executing agent: ${String(error)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteMCP = async () => {
    if (!toolName.trim()) {
      alert("Tool name is required");
      return;
    }

    setIsExecuting(true);
    try {
      let input = {};
      try {
        input = JSON.parse(inputData);
      } catch {
        // Use empty object if invalid JSON
      }

      await api.executeMCP({ tool_name: toolName, input_data: input });
      setToolName("");
      setInputData("{}");
      await loadExecutions();
    } catch (error) {
      alert(`Error executing tool: ${String(error)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Execution Form */}
      <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-[#23272f]">
        <h3 className="text-lg font-bold mb-4">Execute</h3>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab("n8n")}
            className={`px-3 py-2 font-medium border-b-2 ${
              activeTab === "n8n"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 dark:text-gray-300"
            }`}
          >
            n8n
          </button>
          <button
            onClick={() => setActiveTab("flowise")}
            className={`px-3 py-2 font-medium border-b-2 ${
              activeTab === "flowise"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 dark:text-gray-300"
            }`}
          >
            Flowise
          </button>
          <button
            onClick={() => setActiveTab("mcp")}
            className={`px-3 py-2 font-medium border-b-2 ${
              activeTab === "mcp"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 dark:text-gray-300"
            }`}
          >
            MCP
          </button>
        </div>

        {/* n8n Form */}
        {activeTab === "n8n" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Workflow ID
              </label>
              <input
                type="text"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                placeholder="n8n workflow ID"
                className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Input Data (JSON)
              </label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded font-mono text-sm"
                rows={4}
              />
            </div>
            <button
              onClick={handleExecuteN8N}
              disabled={isExecuting || !workflowId.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isExecuting ? "Executing..." : "Execute Workflow"}
            </button>
          </div>
        )}

        {/* Flowise Form */}
        {activeTab === "flowise" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Agent ID</label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Flowise agent ID"
                className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Input Data (JSON)
              </label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder='{"question": "your question"}'
                className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded font-mono text-sm"
                rows={4}
              />
            </div>
            <button
              onClick={handleExecuteFlowise}
              disabled={isExecuting || !agentId.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isExecuting ? "Executing..." : "Execute Agent"}
            </button>
          </div>
        )}

        {/* MCP Form */}
        {activeTab === "mcp" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tool Name</label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="MCP tool name"
                className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Input Data (JSON)
              </label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder='{"param": "value"}'
                className="w-full px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded font-mono text-sm"
                rows={4}
              />
            </div>
            <button
              onClick={handleExecuteMCP}
              disabled={isExecuting || !toolName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isExecuting ? "Executing..." : "Execute Tool"}
            </button>
          </div>
        )}
      </div>

      {/* Execution History */}
      <div className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-[#23272f]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Execution History</h3>
          <button
            onClick={loadExecutions}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : executions.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-300 text-center py-4">No executions yet</div>
        ) : (
          <div className="space-y-2">
            {executions.map((execution) => (
              <div
                key={execution.id}
                className="border dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-[#2b3342]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">
                      [{execution.execution_type.toUpperCase()}] {execution.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {execution.created_at
                        ? new Date(execution.created_at).toLocaleString()
                        : ""}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      execution.status === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : execution.status === "error"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {execution.status}
                  </span>
                </div>
                {execution.error_message && (
                  <div className="text-sm text-red-600 dark:text-red-300 mt-1">
                    Error: {execution.error_message}
                  </div>
                )}
                {execution.output_data && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      View Output
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-[#1e2633] rounded text-xs overflow-auto">
                      {JSON.stringify(execution.output_data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

