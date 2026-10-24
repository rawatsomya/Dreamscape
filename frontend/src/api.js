// API helper to communicate with the backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export async function createStory(prompt) {
  const response = await fetch(`${BACKEND_URL}/create-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate story: ${response.statusText}`);
  }

  return response.json();
}
