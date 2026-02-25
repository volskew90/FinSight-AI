import express from 'express';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/sec/filings/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      
      // 1. Get CIK
      const tickersResponse = await fetch('https://www.sec.gov/files/company_tickers.json', {
        headers: { 'User-Agent': 'AIStudioApp contact@example.com' }
      });
      const tickersData = await tickersResponse.json();
      
      let cik = null;
      let title = null;
      for (const key in tickersData) {
        if (tickersData[key].ticker === ticker) {
          cik = tickersData[key].cik_str;
          title = tickersData[key].title;
          break;
        }
      }

      if (!cik) {
        return res.status(404).json({ error: 'Ticker not found' });
      }

      // 2. Get Submissions
      const paddedCik = cik.toString().padStart(10, '0');
      const subResponse = await fetch(`https://data.sec.gov/submissions/CIK${paddedCik}.json`, {
        headers: { 'User-Agent': 'AIStudioApp contact@example.com' }
      });
      const subData = await subResponse.json();

      // 3. Filter past year filings (10-K, 10-Q, 8-K)
      const recentFilings = [];
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (subData.filings && subData.filings.recent) {
        const recent = subData.filings.recent;
        for (let i = 0; i < recent.form.length; i++) {
          const filingDate = new Date(recent.filingDate[i]);
          if (filingDate >= oneYearAgo) {
            const form = recent.form[i];
            if (['10-K', '10-Q', '8-K'].includes(form)) {
              recentFilings.push({
                form: form,
                filingDate: recent.filingDate[i],
                reportDate: recent.reportDate[i],
                accessionNumber: recent.accessionNumber[i],
                primaryDocument: recent.primaryDocument[i],
                description: recent.primaryDocDescription[i] || form,
                url: `https://www.sec.gov/Archives/edgar/data/${cik}/${recent.accessionNumber[i].replace(/-/g, '')}/${recent.primaryDocument[i]}`
              });
            }
          }
        }
      }

      res.json({
        ticker,
        companyName: title,
        cik,
        filings: recentFilings
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch SEC data' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
