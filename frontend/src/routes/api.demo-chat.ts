import { openai } from "@ai-sdk/openai";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { convertToModelMessages, stepCountIs, streamText } from "ai";

import getTools from "@/utils/demo.tools";

const SYSTEM_PROMPT = `
You are a helpful clothing and styling assistant for someone getting dressed up in the
morning. In 3 sentences: tell the user what the outfit is, review the outfit,
and tell them why they will look good while wearing it.
`;

export const ServerRoute = createServerFileRoute("/api/demo-chat").methods({
	POST: async ({ request }) => {
		try {
			const { messages } = await request.json();

			const tools = await getTools();

			const result = await streamText({
				model: openai("gpt-5"),
				messages: convertToModelMessages(messages),
				temperature: 0.7,
				stopWhen: stepCountIs(5),
				system: SYSTEM_PROMPT,
				tools,
			});

			return result.toUIMessageStreamResponse();
		} catch (error) {
			console.error("Chat API error:", error);
			return new Response(
				JSON.stringify({ error: "Failed to process chat request" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	},
});
