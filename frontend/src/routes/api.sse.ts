import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServerFileRoute } from "@tanstack/react-start/server";

import { server, transports } from "@/utils/demo.sse";

export const ServerRoute = createServerFileRoute("/api/sse").methods({
	// @ts-expect-error
	GET: async () => {
		let body = "";
		let headers: Record<string, string> = {};
		let statusCode = 200;

		type MinimalServerResponse = {
			on: (event: string, callback: () => void) => void;
			writeHead: (statusCode: number, headers: Record<string, string>) => void;
			write: (data: string) => void;
		};

		const resp: MinimalServerResponse = {
			on: (event: string, callback: () => void) => {
				if (event === "close") {
					callback();
				}
			},
			writeHead: (sc: number, h: Record<string, string>) => {
				headers = h;
				statusCode = sc;
			},
			write: (data: string) => {
				body += `${data}\n`;
			},
		};
		const transport = new SSEServerTransport("/api/messages", resp);
		transports[transport.sessionId] = transport;
		transport.onerror = (error) => {
			console.error(error);
		};
		resp.on("close", () => {
			delete transports[transport.sessionId];
		});
		await server.connect(transport);
		const response = new Response(body, {
			status: statusCode,
			headers: headers,
		});
		return response;
	},
});
