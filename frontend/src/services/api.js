const API_URL = "http://localhost:3000";

export async function api(url, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || data.error || "Erro na requisição.");
  }

  return data;
}

