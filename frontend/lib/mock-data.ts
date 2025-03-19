// Generate random number between min and max
const randomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Generate random date within the last n days
const randomDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date.toISOString();
};

// Generate mock sentiment data for the chart
const generateSentimentData = (ticker: string, days = 7) => {
  const data = [];
  const basePrice =
    ticker === 'AAPL'
      ? 180
      : ticker === 'TSLA'
      ? 240
      : ticker === 'MSFT'
      ? 400
      : 150;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = [
    Math.floor(Math.random() * days),
    Math.floor(Math.random() * days),
  ];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const sentimentBase = randomNumber(-0.5, 0.5);
    const sentimentNoise = randomNumber(-0.2, 0.2);
    const sentiment = Math.max(-1, Math.min(1, sentimentBase + sentimentNoise));

    const priceChange = sentiment * randomNumber(1, 5) + randomNumber(-2, 2);
    const price = basePrice + priceChange * (i + 1);

    data.push({
      date: date.toISOString(),
      left: sentiment, // Changed from sentiment: { left: sentiment }
      right: price, // Changed from price: { right: price }
      event: events.includes(i),
    });
  }

  return data;
};

// Generate mock news items
const generateNewsItems = (ticker: string) => {
  const newsTemplates = [
    {
      positive: `${ticker} Exceeds Quarterly Expectations, Shares Surge`,
      negative: `${ticker} Misses Earnings Targets, Stock Tumbles`,
      neutral: `${ticker} Reports Mixed Results in Latest Quarter`,
    },
    {
      positive: `Analysts Upgrade ${ticker} on Strong Growth Prospects`,
      negative: `${ticker} Downgraded by Multiple Analysts Citing Concerns`,
      neutral: `Market Analysts Remain Divided on ${ticker}'s Future`,
    },
    {
      positive: `${ticker} Announces Major Expansion into New Markets`,
      negative: `${ticker} Faces Regulatory Scrutiny in Key Markets`,
      neutral: `${ticker} Restructures Operations to Streamline Costs`,
    },
    {
      positive: `${ticker} Launches Innovative New Product Line`,
      negative: `${ticker} Recalls Products Due to Quality Concerns`,
      neutral: `${ticker} Updates Product Lineup with Minor Improvements`,
    },
    {
      positive: `${ticker} Forms Strategic Partnership with Industry Leader`,
      negative: `${ticker} Loses Key Partnership Deal, Shares Drop`,
      neutral: `${ticker} Renegotiates Terms with Existing Partners`,
    },
  ];

  const sources = [
    'Bloomberg',
    'Reuters',
    'CNBC',
    'Wall Street Journal',
    'Financial Times',
    'MarketWatch',
  ];

  const news = [];

  for (let i = 0; i < 6; i++) {
    const template = newsTemplates[i % newsTemplates.length];
    const sentimentTypes = ['positive', 'negative', 'neutral'] as const;
    const sentiment = sentimentTypes[Math.floor(Math.random() * 3)];
    const score =
      sentiment === 'positive'
        ? randomNumber(0.3, 0.9)
        : sentiment === 'negative'
        ? randomNumber(-0.9, -0.3)
        : randomNumber(-0.2, 0.2);

    news.push({
      title: template[sentiment],
      source: sources[Math.floor(Math.random() * sources.length)],
      date: randomDate(7),
      url: '#',
      sentiment,
      score,
    });
  }

  return news;
};

// Generate mock social media posts
const generateSocialPosts = (ticker: string) => {
  const usernames = [
    'InvestorPro',
    'StockGuru',
    'MarketWatcher',
    'TradeMaster',
    'WallStInsider',
    'BullBearTrader',
  ];
  const handles = [
    'investor123',
    'stockguru',
    'marketwatch',
    'trademaster',
    'wallstinsider',
    'bullbear',
  ];

  const positiveTemplates = [
    `Just bought more $${ticker}! This stock is going to the moon! 🚀`,
    `$${ticker} earnings were incredible. Management team is crushing it! 💰`,
    `The future looks bright for $${ticker}. Adding to my position today.`,
    `$${ticker} is undervalued at current prices. Strong buy signal! 📈`,
    `Analyst upgrades for $${ticker} are spot on. This company is innovating like crazy.`,
  ];

  const negativeTemplates = [
    `Dumping my $${ticker} shares. This company is heading downhill fast. 📉`,
    `$${ticker} earnings were a disaster. Management needs to go!`,
    `Serious concerns about $${ticker}'s business model. Shorting this stock.`,
    `$${ticker} is way overvalued. Bubble about to burst! ⚠️`,
    `Analyst downgrades for $${ticker} are justified. Avoid at all costs.`,
  ];

  const neutralTemplates = [
    `Watching $${ticker} closely. Could go either way at this point.`,
    `$${ticker} had mixed results this quarter. Holding my position for now.`,
    `Not sure what to make of the latest $${ticker} news. Any thoughts?`,
    `$${ticker} seems fairly valued at current prices. No action for me.`,
    `Interesting developments at $${ticker}. Need more data before deciding.`,
  ];

  const posts = [];

  for (let i = 0; i < 5; i++) {
    const sentimentTypes = ['positive', 'negative', 'neutral'] as const;
    const sentiment = sentimentTypes[Math.floor(Math.random() * 3)];
    const templates =
      sentiment === 'positive'
        ? positiveTemplates
        : sentiment === 'negative'
        ? negativeTemplates
        : neutralTemplates;

    const score =
      sentiment === 'positive'
        ? randomNumber(0.3, 0.9)
        : sentiment === 'negative'
        ? randomNumber(-0.9, -0.3)
        : randomNumber(-0.2, 0.2);

    const randomIndex = Math.floor(Math.random() * usernames.length);

    posts.push({
      username: usernames[randomIndex],
      handle: handles[randomIndex],
      avatar: `/placeholder.svg?height=40&width=40`,
      content: templates[Math.floor(Math.random() * templates.length)],
      platform: Math.random() > 0.5 ? 'twitter' : 'reddit',
      date: randomDate(3),
      sentiment,
      score,
      likes: Math.floor(randomNumber(10, 2000)),
      comments: Math.floor(randomNumber(0, 200)),
      shares: Math.floor(randomNumber(0, 500)),
    });
  }

  return posts;
};

// Generate stock info
const generateStockInfo = (ticker: string) => {
  const basePrice =
    ticker === 'AAPL'
      ? 180
      : ticker === 'TSLA'
      ? 240
      : ticker === 'MSFT'
      ? 400
      : 150;
  const change = randomNumber(-15, 15);
  const price = basePrice + change;
  const changePercent = (change / basePrice) * 100;

  const sentimentScore = randomNumber(-0.8, 0.8);
  let overallSentiment: 'positive' | 'negative' | 'neutral';

  if (sentimentScore > 0.2) {
    overallSentiment = 'positive';
  } else if (sentimentScore < -0.2) {
    overallSentiment = 'negative';
  } else {
    overallSentiment = 'neutral';
  }

  return {
    ticker,
    price,
    change,
    changePercent,
    overallSentiment,
    sentimentScore,
  };
};

// Main function to generate all mock data
export const generateMockData = (ticker: string) => {
  return {
    sentimentData: generateSentimentData(ticker),
    newsItems: generateNewsItems(ticker),
    socialPosts: generateSocialPosts(ticker),
    stockInfo: generateStockInfo(ticker),
  };
};
