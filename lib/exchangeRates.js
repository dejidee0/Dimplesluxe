const EXCHANGE_RATE_APIS = [
  {
    name: "exchangerate.host",
    url: (from, to) =>
      `https://api.exchangerate.host/convert?access_key=c2c960ebe9d2757e4a386e03a8f8a7ad&from=${from}&to=${to}&amount=1`,
    parseRate: (data) => data.info.quote,
  },
];

// Fallback rates in case all APIs fail
const FALLBACK_RATES = {
  GBP_TO_NGN: 1850,
  USD_TO_NGN: 1500,
  EUR_TO_NGN: 1600,
  GBP_TO_GBP: 1,
  NGN_TO_GBP: 1 / 1850,
};

// Cache for exchange rates (valid for 1 hour)
let exchangeRateCache = {
  rates: {},
  timestamp: 0,
  ttl: 60 * 60 * 1000, // 1 hour in milliseconds
};

/**
 * Fetch live exchange rate from exchangerate.host with fallback
 */
export const fetchLiveExchangeRate = async (
  baseCurrency = "GBP",
  targetCurrency = "NGN"
) => {
  const cacheKey = `${baseCurrency}_TO_${targetCurrency}`;
  const now = Date.now();

  // Check cache first
  if (
    exchangeRateCache.rates[cacheKey] &&
    now - exchangeRateCache.timestamp < exchangeRateCache.ttl
  ) {
    console.log(
      `Using cached rate for ${cacheKey}: ${exchangeRateCache.rates[cacheKey]}`
    );
    return exchangeRateCache.rates[cacheKey];
  }

  // Try exchangerate.host API
  for (const api of EXCHANGE_RATE_APIS) {
    try {
      console.log(`Fetching exchange rate from ${api.name}...`);
      const response = await fetch(api.url(baseCurrency, targetCurrency), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Dimplesluxe-Exchange-Rate-Fetcher",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(`API Error: ${data.error?.info || "Unknown error"}`);
      }

      const rate = api.parseRate(data);

      if (rate && typeof rate === "number" && rate > 0) {
        // Update cache
        exchangeRateCache.rates[cacheKey] = rate;
        exchangeRateCache.timestamp = now;

        console.log(
          `✅ Exchange rate fetched from ${api.name}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`
        );
        return rate;
      } else {
        throw new Error("Invalid exchange rate received");
      }
    } catch (error) {
      console.warn(`❌ Failed to fetch from ${api.name}:`, error.message);
      continue;
    }
  }

  // All APIs failed, use fallback
  const fallbackRate = FALLBACK_RATES[cacheKey] || FALLBACK_RATES.GBP_TO_NGN;
  console.warn(
    `⚠️ All exchange rate APIs failed, using fallback rate: ${fallbackRate} for ${cacheKey}`
  );

  // Cache fallback rate for shorter period (15 minutes)
  exchangeRateCache.rates[cacheKey] = fallbackRate;
  exchangeRateCache.timestamp = now - (exchangeRateCache.ttl - 15 * 60 * 1000);

  return fallbackRate;
};

/**
 * Get multiple exchange rates at once
 */
export const fetchMultipleRates = async (
  baseCurrency = "GBP",
  targetCurrencies = ["NGN", "USD", "EUR"]
) => {
  const rates = {};

  for (const target of targetCurrencies) {
    try {
      rates[target] = await fetchLiveExchangeRate(baseCurrency, target);
    } catch (error) {
      console.error(
        `Failed to fetch ${baseCurrency} to ${target} rate:`,
        error
      );
      rates[target] = FALLBACK_RATES[`${baseCurrency}_TO_${target}`] || 1;
    }
  }

  return rates;
};

/**
 * Convert amount between currencies
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;

  const rate = await fetchLiveExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
};

/**
 * Format currency with proper symbols and locale
 */
export const formatCurrencyWithRate = (amount, currency, rate = 1) => {
  const convertedAmount = currency === "NGN" ? amount * rate : amount;

  const formatters = {
    GBP: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }),
    NGN: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    EUR: new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR" }),
  };

  const formatter = formatters[currency] || formatters.GBP;
  return formatter.format(convertedAmount);
};

/**
 * Get exchange rate update timestamp
 */
export const getLastUpdateTime = () => {
  return exchangeRateCache.timestamp
    ? new Date(exchangeRateCache.timestamp)
    : null;
};

/**
 * Clear exchange rate cache (useful for testing)
 */
export const clearExchangeRateCache = () => {
  exchangeRateCache = {
    rates: {},
    timestamp: 0,
    ttl: 60 * 60 * 1000,
  };
};

/**
 * Get cached rates without fetching
 */
export const getCachedRates = () => {
  return { ...exchangeRateCache.rates };
};
