import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// 使用类型化的 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 便捷的选择器 hooks
export const useUser = () => useAppSelector((state) => state.user);
export const useCart = () => useAppSelector((state) => state.cart);
export const useProduct = () => useAppSelector((state) => state.product);

// 计算派生状态的 hooks
export const useCartTotal = () => {
  return useAppSelector((state) => ({
    totalQuantity: state.cart.totalQuantity,
    totalAmount: state.cart.totalAmount,
    itemCount: state.cart.items.length,
  }));
};

export const useIsLoggedIn = () => {
  return useAppSelector((state) => state.user.isLoggedIn);
};

export const useCurrentUser = () => {
  return useAppSelector((state) => state.user.currentUser);
};