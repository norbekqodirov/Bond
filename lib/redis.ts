import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;
let connecting: Promise<RedisClient> | null = null;

export async function getRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not set");
  }

  if (client?.isOpen) {
    return client;
  }

  if (connecting) {
    return connecting;
  }

  client = createClient({ url });
  client.on("error", () => {});
  connecting = client.connect().then(() => {
    connecting = null;
    return client!;
  });

  return connecting;
}
