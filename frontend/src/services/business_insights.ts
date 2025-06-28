import { InferenceClient } from "@huggingface/inference";

const SYSTEM_PROMPT = `Vous êtes un expert en analyse d'entreprise. 
À partir d'une liste d’avis clients sur une entreprise, résumez la 
perception générale de celle-ci en une phrase concise permettant à un client potentiel de 
comprendre rapidement sa réputation, ses points forts ou ses faiblesses. Soyez clair, neutre et pertinent.
`;
const hf = new InferenceClient("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");

export async function getBusinessInsightFromMistral(
  reviews: string[]
): Promise<string | undefined> {
  console.log("AI Request:", { reviews });
  try {
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: reviews.join("\n\n"),
        },
      ],
      max_tokens: 500,
    });

    const result = response.choices[0].message.content;
    console.log("AI Response raw:", result);
    return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error occurred");
    }
    return undefined;
  }
}
