const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const defaultOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function buildUrl(path, query = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function apiFetch(path, options = {}) {
  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  return handleResponse(await fetch(path, requestOptions));
}

export { API_BASE, buildUrl, apiFetch };
