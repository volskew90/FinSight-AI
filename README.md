# FinSight AI

FinSight AI is a full-stack web application that provides AI-powered financial insights and recent SEC filings for US publicly traded companies. By simply entering a stock ticker, users can get a comprehensive overview of a company's recent financial health and strategic direction.

## Features

- **SEC EDGAR Integration**: Automatically fetches the latest 10-K (Annual Reports), 10-Q (Quarterly Reports), and 8-K (Current Reports) filings from the past 12 months directly from the U.S. Securities and Exchange Commission (SEC) database.
- **AI Financial Summary**: Utilizes Google's **Gemini 3.1 Pro** model, augmented with **Google Search Grounding**, to generate a detailed Markdown summary covering:
  - Financial Performance (Revenue, Profit, EPS, etc.)
  - Major Announcements & Strategic Moves (Acquisitions, leadership changes, product launches)
  - Overall Outlook & Guidance
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a clean, responsive, and intuitive user experience.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide React
- **Backend**: Node.js, Express (Used to proxy SEC API requests and handle CORS/User-Agent requirements)
- **AI**: Google GenAI SDK (`@google/genai`)

## Prerequisites

To run this application, you need a Gemini API Key. 

Create a `.env` file in the root directory and add your key:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   This will start both the Express backend API and the Vite frontend development server concurrently using `tsx`.

3. **Build for production**:
   ```bash
   npm run build
   ```

## How it Works

1. **User Input**: The user enters a US stock ticker (e.g., `AAPL`, `MSFT`, `TSLA`).
2. **Backend Fetch**: The Express server queries the SEC's `company_tickers.json` to resolve the ticker to a CIK (Central Index Key). It then fetches the company's submission history from `data.sec.gov`, filters the filings for the past year, and returns the data to the frontend.
3. **AI Generation**: Once the SEC data is retrieved, the frontend triggers a call to the Gemini API. It prompts the model to act as a financial analyst, using Google Search to gather the latest news and earnings call data to synthesize a comprehensive summary.
4. **Display**: The UI renders the AI-generated Markdown summary alongside a scrollable list of direct links to the official SEC filings.

## License

MIT
