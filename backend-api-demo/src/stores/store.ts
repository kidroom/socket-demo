// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// 導出 RootState 的類型，方便在 useSelector 中使用
export type RootState = ReturnType<typeof store.getState>;
// 導出 AppDispatch 的類型，方便在 useDispatch 中使用
export type AppDispatch = typeof store.dispatch;
