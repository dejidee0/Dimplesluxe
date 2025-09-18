import { create } from "zustand";
import { fetchLiveExchangeRate } from "./exchangeRates";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      currency: "GBP",
      exchangeRate: 1850, // GBP to NGN
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      setCurrency: (currency) => set({ currency }),
      setExchangeRate: (rate) =>
        set({
          exchangeRate: rate,
          lastRateUpdate: new Date().toISOString(),
        }),

      // Fetch live exchange rate
      fetchExchangeRate: async (
        baseCurrency = "GBP",
        targetCurrency = "NGN"
      ) => {
        set({ exchangeRateLoading: true });
        try {
          const rate = await fetchLiveExchangeRate(
            baseCurrency,
            targetCurrency
          );
          set({
            exchangeRate: rate,
            exchangeRateLoading: false,
            lastRateUpdate: new Date().toISOString(),
          });
          return rate;
        } catch (error) {
          console.error("Failed to fetch exchange rate:", error);
          set({ exchangeRateLoading: false });
          // Keep existing rate as fallback
          return get().exchangeRate;
        }
      },

      convertPrice: (price) => {
        const { currency, exchangeRate } = get();
        return currency === "NGN" ? price * exchangeRate : price;
      },

      // Get currency symbol
      getCurrencySymbol: () => {
        const { currency } = get();
        return currency === "NGN" ? "₦" : "£";
      },

      // Get formatted rate info
      getRateInfo: () => {
        const { exchangeRate, lastRateUpdate, exchangeRateLoading } = get();
        return {
          rate: exchangeRate,
          lastUpdate: lastRateUpdate,
          loading: exchangeRateLoading,
          isLive:
            lastRateUpdate &&
            Date.now() - new Date(lastRateUpdate).getTime() < 3600000, // 1 hour
        };
      },
    }),
    { name: "cart-storage" }
  )
);

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null }),
  isAdmin: () => {
    const user = get().user;
    return user?.user_metadata?.role === "admin";
  },
}));

export const useFilterStore = create((set) => ({
  filters: {
    category: "",
    subcategory: "",
    minPrice: 0,
    maxPrice: 999999,
    search: "",
    sortBy: "name",
    length: "",
    color: "",
    texture: "",
  },
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  clearFilters: () =>
    set({
      filters: {
        category: "",
        subcategory: "",
        minPrice: 0,
        maxPrice: 999999,
        search: "",
        sortBy: "name",
        length: "",
        color: "",
        texture: "",
      },
    }),
}));

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      setWishlist: (wishlist) => set({ wishlist }),
      addToWishlist: (product) => {
        const wishlist = get().wishlist;
        if (!wishlist.find((item) => item.id === product.id)) {
          set({ wishlist: [...wishlist, product] });
        }
      },
      removeFromWishlist: (productId) => {
        set({
          wishlist: get().wishlist.filter((item) => item.id !== productId),
        });
      },
      clearWishlist: () => set({ wishlist: [] }),
      isWishlisted: (productId) => {
        return get().wishlist.some((item) => item.id === productId);
      },
    }),
    { name: "wishlist-storage" }
  )
);

export const useUIStore = create((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeAll: () =>
    set({ isCartOpen: false, isMobileMenuOpen: false, isSearchOpen: false }),
}));
