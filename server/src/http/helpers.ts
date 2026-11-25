import http from 'node:http';
import type { ServerEnv } from '../env.ts';

export async function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    throw new HttpError(400, 'invalid_json', 'Dữ liệu JSON gửi lên không hợp lệ.');
  }
}

export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function buildCorsHeaders(origin: string | undefined, env: ServerEnv): Record<string, string> {
  const allow = !origin || env.allowedOrigins.includes(origin) || origin.startsWith('http://127.0.0.1:') || origin.startsWith('http://localhost:');
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(allow ? { 'Access-Control-Allow-Origin': origin || '*' } : {}),
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  };
}

export function sendJson(
  res: http.ServerResponse,
  status: number,
  data: unknown,
  origin: string | undefined,
  env: ServerEnv
): void {
  const headers = buildCorsHeaders(origin, env);
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}
