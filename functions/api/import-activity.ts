interface Env {
  ANTHROPIC_API_KEY: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PROMPT = `Analise este screenshot de um app de fitness e extraia os dados do treino.
Responda APENAS com um objeto JSON válido, sem markdown, seguindo este schema:

{
  "type": "strength" | "cardio" | "unknown",
  "session": "lower-a" | "upper-a" | "lower-b" | "upper-b" | null,
  "week": <número 1-53 da semana ISO atual>,
  "exercises": [
    { "name": "Nome do exercício", "sets": [{ "load": 80.0, "reps": 8 }] }
  ],
  "cardio": {
    "durationMin": 45,
    "distanceKm": 7.2,
    "hrAvg": 145,
    "hrMax": 165,
    "type": "run" | "ride" | "walk" | "swim" | "other"
  },
  "confidence": 0.92,
  "notes": "contexto adicional"
}

Para "session", mapeie: Lower A/B = agachamentos/leg press/RDL; Upper A/B = supino/remada/ombros.
Se não conseguir identificar, use null. confidence entre 0 e 1 indica sua certeza.`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const formData = await request.formData();
  const imageFile = formData.get("image");

  if (!imageFile || !(imageFile instanceof File)) {
    return Response.json(
      { ok: false, error: "Campo 'image' não encontrado." },
      { headers: CORS_HEADERS },
    );
  }

  const arrayBuffer = await imageFile.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const mediaType = (imageFile.type || "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: SYSTEM_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    return Response.json(
      { ok: false, error: `Erro na API Anthropic: ${errorText}` },
      { headers: CORS_HEADERS },
    );
  }

  const anthropicData = (await anthropicResponse.json()) as {
    content: Array<{ type: string; text: string }>;
  };

  const textContent = anthropicData.content.find((c) => c.type === "text");
  if (!textContent) {
    return Response.json(
      { ok: false, error: "Resposta vazia da IA." },
      { headers: CORS_HEADERS },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textContent.text.trim());
  } catch {
    return Response.json(
      { ok: false, error: "A IA não retornou JSON válido." },
      { headers: CORS_HEADERS },
    );
  }

  return Response.json({ ok: true, data: parsed }, { headers: CORS_HEADERS });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: CORS_HEADERS });
};
