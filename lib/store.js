import { create } from "zustand";
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
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
      convertPrice: (price) => {
        const { currency, exchangeRate } = get();
        return currency === "NGN" ? price * exchangeRate : price;
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
