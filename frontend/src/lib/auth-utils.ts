import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  user_id: number;
  role: string;
  exp: number;
}

export function decodeToken(token: string): JwtPayload {
  return jwtDecode<JwtPayload>(token);
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}
