import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: "gpt-5.4",
  input: "Say hello in Portuguese."
});

console.log(response.output_text);