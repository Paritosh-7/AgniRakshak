import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;
const knowledgePath = path.join(process.cwd(), "knowledge.json");

// Load knowledge.json into memory
let knowledge = {};
try {
  if (fs.existsSync(knowledgePath)) {
    knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf-8"));
  }
} catch (err) {
  console.error("Error reading knowledge.json:", err);
  knowledge = {};
}

let chatHistory = [];

// 🔹 Slightly smarter similarity check
function findSimilarPrompt(userPrompt) {
  const lowerPrompt = userPrompt.toLowerCase();
  for (const key in knowledge) {
    const lowerKey = key.toLowerCase();
    // Match if: direct substring OR 70% of words match
    const userWords = lowerPrompt.split(/\s+/);
    const keyWords = lowerKey.split(/\s+/);
    const matchCount = userWords.filter(word => keyWords.includes(word)).length;
    const matchRatio = matchCount / Math.max(userWords.length, keyWords.length);
    
    if (
      lowerPrompt.includes(lowerKey) ||
      lowerKey.includes(lowerPrompt) ||
      matchRatio >= 0.7
    ) {
      return knowledge[key];
    }
  }
  return null;
}

// 🔹 Keywords related to emergency/fire services
const emergencyKeywords = [
  "fire", "burn", "smoke", "emergency", "firefighter",
  "ambulance", "rescue", "evacuate", "earthquake",
  "disaster", "accident", "first aid", "911", "police",
  "flood", "cyclone", "tsunami", "injury", "help"
];

function isEmergencyRelated(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  return emergencyKeywords.some(keyword => lowerPrompt.includes(keyword));
}

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // 1️⃣ Check knowledge.json first
  const storedAnswer = findSimilarPrompt(userMessage);
  if (storedAnswer) {
    chatHistory.push({ role: "user", content: userMessage });
    chatHistory.push({ role: "assistant", content: storedAnswer });
    return res.json({ reply: storedAnswer, source: "knowledge" });
  }

  // 2️⃣ Reject non-emergency questions without calling API
  if (!isEmergencyRelated(userMessage)) {
    const reply = "I’m here to assist only with fire safety and emergency-related queries. Please ask something relevant.";
    chatHistory.push({ role: "user", content: userMessage });
    chatHistory.push({ role: "assistant", content: reply });
    return res.json({ reply, source: "restricted" });
  }

  // 3️⃣ Otherwise, make API call
  chatHistory.push({ role: "user", content: userMessage });
  if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-70b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are Saarthi, a helpful fire and emergency service assistant for a website named Agnirakshak. Only respond to queries related to fire safety, rescue operations, first aid, and emergency preparedness. Politely refuse unrelated requests.",
          },
          ...chatHistory,
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Agnirakshak Chatbot",
        },
      }
    );

    const botReply = response.data.choices[0].message.content;
    chatHistory.push({ role: "assistant", content: botReply });

    // Save new Q&A to knowledge.json
    knowledge[userMessage] = botReply;
    fs.writeFileSync(knowledgePath, JSON.stringify(knowledge, null, 2), "utf-8");

    res.json({ reply: botReply, source: "llm" });
  } catch (error) {
    console.error("OpenRouter API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong with OpenRouter API." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
