import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY);

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return { ...payload, token };
  } catch {
    return null;
  }
}
