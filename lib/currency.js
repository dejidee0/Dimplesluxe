// Currency conversion utilities
export const CURRENCIES = {
  GBP: { symbol: '£', name: 'British Pound' },
  NGN: { symbol: '₦', name: 'Nigerian Naira' }
}

export const formatPrice = (price, currency = 'GBP', exchangeRate = 1850) => {
  const convertedPrice = currency === 'NGN' ? price * exchangeRate : price
  const symbol = CURRENCIES[currency].symbol
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency === 'NGN' ? 'NGN' : 'GBP',
    currencyDisplay: 'symbol'
  }).format(convertedPrice).replace(/NGN|GBP/, symbol)
}

// Fetch live exchange rates
export const fetchExchangeRate = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/GBP')
    const data = await response.json()
    return data.rates.NGN || 1850 // Fallback rate
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return 1850 // Fallback rate
  }
}