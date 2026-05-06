const callGemini = async (model: string, prompt: string, apiKey: string) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed");
  }

  return data;
};

export const getWorkoutSuggestion = async (prompt: string) => {
  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  const modelChain = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite"
  ];

  for (const model of modelChain) {
    try {
      console.log(`Trying model: ${model}`);
      const data = await callGemini(model, prompt, API_KEY);

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;

    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err.message);
    }
  }

  return "All models failed (likely quota or server load issue)";
};