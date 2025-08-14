import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Member {
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  designation: string | null;
  joinedAt: string | null;
}

interface Admin {
  name: string;
  email: string;
  role:string;
  nic: string | null;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string | null;
}



interface UserState {
  admin: Admin | null;
  member: Member | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  admin: null,
  member: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set admin + organization (used for admin logins)
    setAdminUser(
      state,
      action: PayloadAction<Admin>
    ) {
      state.admin = action.payload;
      state.member = null;
      state.isAuthenticated = true;
    },

    // Set member only (used for member logins)
    setMemberUser(state, action: PayloadAction<Member>) {
      state.member = action.payload;
      state.admin = null;
      state.isAuthenticated = true;
    },

    logoutUser(state) {
      state.admin = null;
      state.member = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAdminUser, setMemberUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
