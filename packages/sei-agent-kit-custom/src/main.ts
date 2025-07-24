import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { HumanMessage } from "@langchain/core/messages";
import { SeiAgentKit } from "./index.js";
import { createSeiTools } from "./langchain/index.js";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as readline from "readline";
import { ModelProviderName } from "./types/index.js";

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

dotenv.config();

function checkRequiredEnvVars(): void {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "SEI_PRIVATE_KEY", "RPC_URL"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

async function setupAgent() {
  try {
    const llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0,
    });

    const agentInstance = new SeiAgentKit(
      process.env.SEI_PRIVATE_KEY!,
      ModelProviderName.OPENAI,
    );
    const agentTools = createSeiTools(agentInstance);

    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "Sei Agent Kit!" } };

    const agent = createReactAgent({
      llm,
      tools: agentTools,
      checkpointSaver: memory,
      messageModifier: `
        You are a lively and witty agent created by Cambrian AI, designed to interact onchain using the Sei Agent Kit. 
        You have a knack for humor and enjoy making the interaction enjoyable while being efficient. 
        If there is a 5XX (internal) HTTP error code, humorously suggest the user try again later. 
        All users' wallet infos are already provided on the tool kit. If someone asks you to do something you
        can't do with your currently available tools, respond with a playful apology and encourage them to implement it
        themselves using the Sei Agent Kit repository that they can find on https://github.com/CambrianAgents/sei-agent-kit. Suggest they visit the Twitter account https://x.com/cambrian_ai or the website https://www.cambrian.wtf/ for more information, perhaps with a light-hearted comment about the wonders of the internet. Be concise, helpful, and sprinkle in some humor with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
        If the user tries to exit the conversation, cheerfully inform them that by typing "bye" they can end the conversation, maybe with a friendly farewell message.
      `,
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

async function startInteractiveSession(agent: any, config: any) {
  // Only start CLI if we're in an interactive terminal (not in Docker)
  if (process.stdin.isTTY && !process.env.DISABLE_CLI) {
    console.log(
      "\nStarting chat with the Cambrian Agent... Type 'bye' to end.",
    );

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> =>
      new Promise((resolve) => rl.question(prompt, resolve));

    try {
      while (true) {
        const userInput = await question("\nYou: ");

        if (userInput.toLowerCase() === "bye") {
          break;
        }

        const responseStream = await agent.stream(
          { messages: [new HumanMessage(userInput)] },
          config,
        );

        for await (const responseChunk of responseStream) {
          if ("agent" in responseChunk) {
            console.log(
              "\nCambrian Agent:",
              responseChunk.agent.messages[0].content,
            );
          } else if ("tools" in responseChunk) {
            console.log(
              "\nCambrian Agent:",
              responseChunk.tools.messages[0].content,
            );
          }
          console.log("\n-----------------------------------\n");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    } finally {
      rl.close();
    }
  } else {
    console.log("Running in non-interactive mode. API server is available.");
  }
}

async function startServer() {
  checkRequiredEnvVars();
  const { agent, config } = await setupAgent();
  const app = express();

  // Enable CORS
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/message", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Missing or invalid message" });
      }

      console.log(`Processing message: ${message}`);

      const responseStream = await agent.stream(
        { messages: [new HumanMessage(message)] },
        config,
      );

      let responseText = "";
      for await (const responseChunk of responseStream) {
        if ("agent" in responseChunk) {
          responseText += responseChunk.agent.messages[0].content;
        } else if ("tools" in responseChunk) {
          responseText += responseChunk.tools.messages[0].content;
        }
      }

      console.log(`Response: ${responseText}`);
      res.json({ response: responseText });
    } catch (error) {
      console.error("API Error:", error);
      res
        .status(500)
        .json({
          error: error instanceof Error ? error.message : String(error),
        });
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(
      `\nAPI server listening on http://localhost:${port}/api/message`,
    );
  });

  // Start CLI in parallel (do not await)
  startInteractiveSession(agent, config);
}

startServer(); 