export function getBearer(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

export function resolveServerIdFromToken(token: string) {
  // JSON: {"default":"TOKEN1","cliente2":"TOKEN2"}
  const raw = process.env.DELIVERY_TOKENS_JSON || "{}";
  let map: Record<string, string> = {};
  try {
    map = JSON.parse(raw);
  } catch {
    map = {};
  }

  for (const [serverId, t] of Object.entries(map)) {
    if (t === token) return serverId;
  }
  return null;
}

export function requireDeliveryAuth(req: Request) {
  const token = getBearer(req);
  if (!token) return null;

  const serverId = resolveServerIdFromToken(token);
  if (!serverId) return null;

  const instanceId = (req.headers.get("x-instance-id") || "unknown").slice(0, 80);

  return { token, serverId, instanceId };
}
