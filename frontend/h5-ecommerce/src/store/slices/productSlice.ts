import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  specs?: Record<string, string | number>;
  tags?: string[];
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  categories: string[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    priceRange: [number, number];
    sortBy: 'price' | 'rating' | 'sales' | 'newest';
    searchKeyword: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  categories: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    priceRange: [0, 10000],
    sortBy: 'newest',
    searchKeyword: '',
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updatePagination: (state, action: PayloadAction<Partial<ProductState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = { ...initialState.pagination };
    },
  },
});

export const {
  setLoading,
  setError,
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setCurrentProduct,
  setCategories,
  updateFilters,
  updatePagination,
  resetFilters,
} = productSlice.actions;

export default productSlice.reducer;