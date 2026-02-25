import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Search, Loader2, FileText, TrendingUp, AlertCircle, Building2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

interface Filing {
  form: string;
  filingDate: string;
  reportDate: string;
  accessionNumber: string;
  primaryDocument: string;
  description: string;
  url: string;
}

interface CompanyData {
  ticker: string;
  companyName: string;
  cik: string;
  filings: Filing[];
}

export default function App() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError('');
    setCompanyData(null);
    setSummary('');

    try {
      const response = await fetch(`/api/sec/filings/${ticker.trim()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch company data. Please check the ticker symbol.');
      }
      const data = await response.json();
      setCompanyData(data);
      
      // After fetching filings, start summarization
      generateSummary(data.companyName, data.ticker);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (companyName: string, tickerSymbol: string) => {
    setSummarizing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is missing.');
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert financial analyst. The user wants a comprehensive summary of the past year's financial reports and major company announcements for ${companyName} (${tickerSymbol}). 
      
Please use Google Search to find the latest financial results (10-K, 10-Q), earnings call summaries, and major company announcements from their official website and reputable news sources over the past 12 months.

Provide a detailed summary formatted in Markdown including:
1. **Financial Performance**: Revenue, Profit, EPS, and key financial metrics.
2. **Major Announcements & Strategic Moves**: Product launches, acquisitions, leadership changes, etc.
3. **Overall Outlook & Guidance**: What the company expects for the upcoming quarters.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setSummary(response.text || 'No summary generated.');
    } catch (err: any) {
      console.error('Summarization error:', err);
      setSummary(`Failed to generate summary: ${err.message}`);
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-zinc-900" />
            <h1 className="text-xl font-semibold tracking-tight">FinSight AI</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-semibold tracking-tight mb-4 text-zinc-900">
            Company Financial Insights
          </h2>
          <p className="text-zinc-500 text-lg">
            Enter a US stock ticker to fetch recent SEC filings and generate an AI-powered summary of the company's financial performance and announcements over the past year.
          </p>
        </div>

        <Card className="max-w-xl mx-auto mb-12 shadow-sm border-zinc-200">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Enter ticker symbol (e.g., AAPL, MSFT, TSLA)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="pl-9 bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900 uppercase"
                  disabled={loading || summarizing}
                />
              </div>
              <Button type="submit" disabled={loading || summarizing || !ticker.trim()} className="bg-zinc-900 text-white hover:bg-zinc-800">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
              </Button>
            </form>
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {companyData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-zinc-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{companyData.companyName}</CardTitle>
                      <CardDescription className="text-zinc-500 mt-1">
                        Ticker: {companyData.ticker} • CIK: {companyData.cik}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6 bg-zinc-50/50">
                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-zinc-500" />
                      AI Financial Summary (Past 12 Months)
                    </h3>
                    {summarizing ? (
                      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-zinc-400" />
                        <p className="text-sm">Analyzing financial reports and news...</p>
                        <p className="text-xs mt-2 text-zinc-400">This may take a few moments.</p>
                      </div>
                    ) : (
                      <div className="prose prose-zinc prose-sm max-w-none">
                        <Markdown>{summary}</Markdown>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-zinc-200 shadow-sm">
                <CardHeader className="pb-4 border-b border-zinc-100">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    Recent SEC Filings
                  </CardTitle>
                  <CardDescription>Past 12 months (10-K, 10-Q, 8-K)</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-100 max-h-[600px] overflow-y-auto">
                    {companyData.filings.length === 0 ? (
                      <div className="p-6 text-center text-sm text-zinc-500">
                        No recent filings found.
                      </div>
                    ) : (
                      companyData.filings.map((filing, idx) => (
                        <a 
                          key={idx}
                          href={filing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 hover:bg-zinc-50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800 mb-2">
                                {filing.form}
                              </span>
                              <p className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {filing.description}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">
                                Filed: {filing.filingDate}
                              </p>
                            </div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
