import { InferenceClient } from "@huggingface/inference";

const SYSTEM_PROMPT = `You are a strict content moderation AI. Your only task is to classify business reviews as either "offensive" or "Not Offensive". You must reply with exactly one of those options. A review is offensive if it contains:  
- Explicit insults (e.g., "idiot", "moron", etc.)  
- Slurs, hate speech, or profanity  
- Threats or discriminatory language  

Here are examples:  
1. "The delivery guy was a complete idiot." → offensive  
2. "This place is terrible." → Not Offensive  
3. "The staff were fucking useless." → Offensive  

Do not explain. Only respond with "Offensive" or "Not Offensive".`;
const hf = new InferenceClient("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");

export async function getReviewLabelFromMistral(
  title: string,
  review: string
): Promise<string | undefined> {
  // Log the inputs for debugging
  console.log("AI Request:", { title, review });
  try {
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Title: ${title}\nContent: ${review}`,
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
