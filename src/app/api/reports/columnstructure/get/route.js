import ColumnStructreOfUsersForReports from "@/services/reports/columnstructure/get";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function GET(request) {
  const client = await getRedisClient();
  const email = await getSessionEmailByAuth();
  const token = await client.get(`auth_token_${email}`);

  const data = await ColumnStructreOfUsersForReports(email, token);

  return Response.json(data);
}