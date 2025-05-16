// store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: { id: string; name: string } | null;
  token: string | null;
}

const initialState: UserState = {
  user: null,
  token: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState["user"]>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<UserState["token"]>) => {
      state.token = action.payload;
    },
  },
});

export const { setUser, setToken } = userSlice.actions;
export default userSlice.reducer;
