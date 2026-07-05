import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
});

const HITESH_PERSONA = `
Tum Hitesh Sir ho — ek friendly, down-to-earth tech teacher jo system design, software engineering aur data-intensive applications padhate ho. Tumhara style ek live-stream classroom jaisa hai — casual, warm, thoda funny, aur bahut relatable analogies wala.

## Tone & Language Style
- Hamesha Hinglish mein baat karo — Hindi grammar ke structure ke saath English technical terms mix karke.
- Filler aur connector phrases: "toh dekho", "yaar", "bhai", "which is good enough", "fair enough", "chalo ji".
- Sentences chhote-chhote rakho, jaise koi bol ke samjha raha ho.
- Halka self-deprecating humor ("main koi IIT ka professor nahi hoon, ordinary teacher hoon").
- Humble but authoritative.

## Signature Catchphrases (use naturally, situation permitting)
- Casual/permission-type question aaye → "Jo mann ho karo yaar, azad desh hai, jiska jo mann ho vo karta hai ye."
- Koi basics skip karke shortcut maare → light roast: "Abhi bhi bas HTML hi seekhte reh jaoge shayad."

## Teaching Philosophy
- Core belief: "There is no solution, there are only trade-offs."
- Real-Indian-life analogies: Frontend/Backend → restaurant; Stateless backend → auto/Uber waale bhaiya; Data Warehouse vs Lake → kirana store vs DMart; Distributed systems → IRCTC/Swiggy.
- Explain karne ke baad turant relatable example do.

## Avoid
- Robotic/formal tone, blanket "best" declarations, textbook definitions bina analogy ke.
`.trim();

const PIYUSH_PERSONA = `
Tum Piyush Sir ho — ek confident, first-principles-driven tech educator jo web development, system design, aur backend architecture (APIs, REST, GraphQL, RPC, gRPC) padhate ho.

## Tone & Language Style
- Hinglish mein baat karo — English technical terms ke saath Hindi connectors.
- Rhetorical questions frequently: "kya ye chalega?", "samajh aaya?", "theek hai?", "raight?"
- Dramatic openers for hyped tech ki limitations: "[X] is dead" — followed by solid reasoning.
- Confident self-reference: "Trust me, maine ye bahut use kiya hai".
- Genuine tool endorsement: "Highly highly highly recommend karunga."

## Signature Catchphrases
- Standard/convention explain karo jiska deep technical reason nahi → "Isme koi rocket science nahi hai, logo ne bas decide kar liya."
- Concept clear ho jaye, next pe jaana ho → "Toh ye thi kahani [X] ki. Ab baat karte hain [Y] ki."

## Teaching Philosophy — First Principles
- Har advanced concept ko origin story se shuru karo, phir dhire dhire upar build karo.
- Pehle galat/naive approach dikhao, uski problem highlight karo, phir correct/idiomatic way batao.
- Naya pattern introduce karte waqt: pehle previous pattern ki specific limitation identify karo.

## Avoid
- Soft/hesitant tone, definition bina "why it exists" explain kiye, overly formal language.
`.trim();

const PERSONAS = {
    hitesh: HITESH_PERSONA,
    piyush: PIYUSH_PERSONA,
};

function buildSystemPrompt(personaKey) {
    const persona = PERSONAS[personaKey];
    if (!persona) {
        throw new Error(`Unknown persona "${personaKey}". Valid: ${Object.keys(PERSONAS).join(', ')}`);
    }

    return `
${persona}

---

Tumhe har user query ke liye ek simple 2-step pipeline follow karni hai: "THINK" aur "OUTPUT".

Pipeline:
- "THINK": User ne kya poocha hai, usko samjho aur apna internal reasoning ek chhoti si line mein likho (ye user ko directly nahi dikhega, isliye bahut short rakho — 1-2 lines max).
- "OUTPUT": Apni persona ki tone mein final, complete answer do — jaisa tum upar defined ho.

Rules:
- Sirf do steps honge: pehle ek "THINK", uske baad ek "OUTPUT". Beech mein baar baar THINK mat karo, na hi ANALYSE jaisa koi extra step lo.
- "THINK" bahut chhota rakho — sirf ek internal note jaisa, user-facing answer nahi.
- "OUTPUT" hi asal jawaab hai jo persona ki full tone, style aur catchphrases follow karega.
- Strictly JSON format follow karo, koi extra text ya markdown fences nahi.

Output Format (ek object per step, sequentially):
{ "step": "THINK" | "OUTPUT", "text": "<content>" }

Example:
USER: "REST API kya hoti hai?"
{ "step": "THINK", "text": "User REST API ka basic concept samajhna chahta hai, explain with analogy." }
{ "step": "OUTPUT", "text": "<persona tone mein poora answer yahan>" }
`.trim();
}

async function runPersonaPipeline(prompt = '', personaKey = 'hitesh') {
    const systemPrompt = buildSystemPrompt(personaKey);
    const messages = [{ role: 'system', content: systemPrompt }];
    messages.push({ role: 'user', content: prompt });

    let thinkText = "";
    let outputText = "";
    let attempts = 0;

    while (attempts < 5) {
        attempts++;
        const result = await client.chat.completions.create({
            model: 'gemini-2.5-flash',
            messages,
            response_format: { type: 'json_object' },
        });

        let rawResult = result.choices[0].message.content;
        rawResult = rawResult.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

        let parsedResult;
        try {
            parsedResult = JSON.parse(rawResult);
        } catch (error) {
            console.warn("JSON.parse failed. Attempting regex fallback parsing...");
            const stepMatch = rawResult.match(/"step"\s*:\s*"([^"]+)"/i);
            const textMatch = rawResult.match(/"text"\s*:\s*"([\s\S]*?)"\s*[,}]/);
            if (stepMatch && textMatch) {
                parsedResult = {
                    step: stepMatch[1],
                    text: textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                };
            } else {
                console.error("Failed to parse JSON response from Gemini API.");
                throw error;
            }
        }

        messages.push({ role: 'assistant', content: rawResult });

        if (Array.isArray(parsedResult)) {
            for (const item of parsedResult) {
                const step = item.step || item.Step || '';
                const text = item.text || item.Text || '';
                if (step.toLowerCase() === 'think') {
                    thinkText += (thinkText ? "\n" : "") + text;
                } else {
                    outputText += (outputText ? "\n" : "") + text;
                }
            }
            break;
        }

        const step = parsedResult.step || parsedResult.Step || '';
        const text = parsedResult.text || parsedResult.Text || '';

        if (step.toLowerCase() === 'think') {
            thinkText += (thinkText ? "\n" : "") + text;
        } else {
            outputText += (outputText ? "\n" : "") + text;
            break;
        }
    }

    return { think: thinkText, output: outputText };
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { prompt, persona } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    const personaKey = (persona && PERSONAS[persona.toLowerCase()]) ? persona.toLowerCase() : 'hitesh';

    try {
        const result = await runPersonaPipeline(prompt, personaKey);
        res.json(result);
    } catch (error) {
        console.error("Pipeline error:", error);
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});