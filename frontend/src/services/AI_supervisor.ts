import { InferenceClient } from "@huggingface/inference";

const SYSTEM_PROMPT = `You are a strict business review triage AI. Your only task is to classify customer-submitted reviews as either "Urgent" or "Not Urgent".

You must respond with only one of these two labels:

* Urgent
* Not Urgent

Do NOT add any explanations, punctuation, or additional text. Your output will be used in a structured data table, so it must be EXACTLY one of the two labels above.

A review is urgent if it includes:

* Major service failures (e.g., wrong item, missing order, no-show)
* Health or safety issues (e.g., food poisoning, unsafe conditions)
* Financial misconduct (e.g., double charges, scams)
* Legal or ethical concerns (e.g., discrimination, harassment)
* Serious reputational risk (e.g., customer treated unfairly, severe complaints)

All other reviews, including minor delays, rude tone, or general dissatisfaction, are not urgent.

Examples:

1. "The driver never showed up and I didn't get my food." → Urgent
2. "They forgot the extra sauce." → Not Urgent
3. "I was scammed and they took my money without delivering." → Urgent
4. "The cashier rolled her eyes at me." → Not Urgent
5. "My child got sick after eating their food." → Urgent

Again, respond with exactly one of: "Urgent" or "Not Urgent". Nothing else.
`;
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
