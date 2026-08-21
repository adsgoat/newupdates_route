import ColumnStructreOfUsersForReports from "@/services/reports/columnstructure/update";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function PUT(request) {
  const client = await getRedisClient();
  const body = await request.json();
  const email = await getSessionEmailByAuth();
  const token = await client.get(`auth_token_${email}`);

  const data = await ColumnStructreOfUsersForReports(body, token, email);

  return Response.json(data);
}