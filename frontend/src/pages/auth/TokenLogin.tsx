export async function tokenLogin(apiKey: string, apiSecret: string) {
  const baseUrl = import.meta.env.VITE_FRAPPE_PATH;
  const url = `/api/method/your_app.api.login_token.login_via_token`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `token ${apiKey}:${apiSecret}`,
    },
    credentials: "include"
  });

  if (!res.ok) throw new Error("Token login failed");

  const data = await res.json();

  if (data.message === "Logged In") {
    localStorage.setItem("frappe_api_key", apiKey);
    localStorage.setItem("frappe_api_secret", apiSecret);
    return data;
  } else {
    throw new Error("Invalid API credentials");
  }
}

export function getStoredToken() {
  const key = localStorage.getItem("frappe_api_key");
  const secret = localStorage.getItem("frappe_api_secret");
  return key && secret ? { key, secret } : null;
}

export function clearToken() {
  localStorage.removeItem("frappe_api_key");
  localStorage.removeItem("frappe_api_secret");
}
