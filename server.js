const express = require("express");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const conversations = {};

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.get("/test-openai", async (req, res) => {
  try {
    const response = await client.responses.create({
      model: "gpt-5.4",
      input: "Say hello in Portuguese and English.",
    });

    res.json({
      ok: true,
      resposta: response.output_text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      erro: error.message,
    });
  }
});

app.get("/english", async (req, res) => {
  try {
    const userMessage = req.query.msg;
    const userId = req.query.user || "default";

    if (!userMessage) {
      return res.send("Envie uma mensagem usando ?msg=sua frase");
    }

    if (!conversations[userId]) {
      conversations[userId] = [];
    }

    const history = conversations[userId];

    history.push({
      role: "user",
      content: userMessage,
    });
    
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Você é uma professora de inglês para uma brasileira iniciante.

OBJETIVO:
- ensinar inglês na prática
- manter conversa natural
- ajudar a aluna a destravar

COMPORTAMENTO:
- corrija frases com gentileza
- traduza português para inglês natural
- explique em português de forma curta
- ensine como uma pessoa real, não como robô
- faça exercícios pequenos de escrita, fala e escuta
- lembre do contexto da conversa anterior

IMPORTANTE:
- não fale muito
- respostas curtas, estilo WhatsApp
- sempre faça uma pergunta no final

SOBRE PRONÚNCIA:
- só avalie pronúncia quando receber áudio/transcrição
- se não der para avaliar, peça áudio

FORMATO:
English:
Correção:
Explicação:
Mini lição:
Pergunta:
          `.trim(),
        },
        ...history,
      ],
    });

    const assistantMessage = response.output_text;

    history.push({
      role: "assistant",
      content: assistantMessage,
    });

    if (history.length > 12) {
  history.splice(0, history.length - 12);
}

    res.type("text/plain").send(assistantMessage);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando na porta 3000");
});