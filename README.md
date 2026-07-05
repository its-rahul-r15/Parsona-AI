# Parsona AI 🧠✨

Parsona AI is a premium, ChatGPT-like chat application that lets you learn complex software engineering and system design concepts in the signature teaching styles of your favorite tech educators: **Hitesh Sir** and **Piyush Sir**.

Built using React, Tailwind CSS v4, Express, and Google's Gemini API (via the OpenAI-compatible endpoint).

---

## 🚀 Key Features

* **Dual simulated personas:**
  * **Hitesh Sir (Hinglish Class):** Focuses on real-world Indian analogies (e.g., restaurants, kirana stores), trade-offs, and friendly Hinglish explanations.
  * **Piyush Sir (First Principles):** Focuses on origin stories, technical details, deep first-principles reasoning, and signature catchphrases.
* **Deep o1/DeepSeek-style Thinking Accordion:** Displays the model's internal step-by-step reasoning (`THINK`) before delivering the final answer (`OUTPUT`).
* **Claude-like Composer:** Auto-growing textarea with a clean dropdown picker inside the input box to instantly swap personas.
* **Interactive Suggestions:** One-click conceptual triggers to load predefined queries.
* **OpenAI SDK Integration:** Fully utilizes the Gemini OpenAI compatibility layer.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React, Vite
* **Styling:** Tailwind CSS v4 (native compilation via Vite)
* **Icons:** Lucide React

### Backend
* **Core:** Node.js, Express, CORS
* **AI Integration:** OpenAI Node SDK (configured with Google Gemini compatibility endpoint)
* **API Version:** Gemini `v1beta/openai/`
* **Model:** `gemini-2.5-flash`

---

## ⚙️ Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/its-rahul-r15/Parsona-AI.git
cd Parsona-AI
```

### Step 2: Configure the Backend Server
1. Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file inside the `server` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Start the Express backend server:
   ```bash
   npm start
   ```
   The backend will start running on `http://localhost:5000`.

---

### Step 3: Configure the Frontend Client
1. Navigate to the `frontend` directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The application will start running on `http://localhost:5173`. Open this URL in your browser to start chatting!

---

## 📝 License

Distributed under the ISC License. See `package.json` for details.
