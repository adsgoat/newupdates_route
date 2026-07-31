import { createClient } from "redis";

const client = createClient({
    url: process.env.REDIS_CONNECTION_STRING,
    socket: {
        reconnectStrategy(retries) {
            if (retries >= 10) {
                console.log("Redis reconnect limit reached. Stopping reconnect attempts.");
                return false; // Stop reconnecting after 10 attempts
            }
            return Math.min(retries * 100, 3000);
        },
    },
});
client.on("connect", () => {
    console.log("Redis Connected");
});

client.on("ready", () => {
    console.log("Redis Ready");
});

client.on("reconnecting", () => {
    console.log("Redis Reconnecting...");
});

client.on("error", (err) => {
    console.error("Redis Error:", err);
});

client.on("end", () => {
    console.log("Redis Connection Closed");
});
// await client.connect();

// const count = await client.dbSize();

// console.log("Keys:", count);
// const info = await client.info("memory");
// console.log(info);

//To delete all keys in the Redis database, you can use the flushAll() method.
// await client.flushAll();

// export default client;
export default async function getRedisClient() {
    if (!client.isOpen) {
        await client.connect();
    }

    return client;
}