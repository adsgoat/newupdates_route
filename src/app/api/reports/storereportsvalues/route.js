import StoreReportsValues from "@/services/reports/storereportsvalues/page";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function POST(request) {
  const client = await getRedisClient();
  const body = await request.json();
  const email = await getSessionEmailByAuth();
  const data = await StoreReportsValues(body, client, email);
  return Response.json(data);
}