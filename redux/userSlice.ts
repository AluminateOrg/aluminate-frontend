import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  designation: string | null;
  joinedAt: string | null;
  isMentor?: boolean | null;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  nic: string | null;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string | null;
}

interface Organization {
  id: string;
  organizationName: string;
  membershipFree: boolean;
  maxMemberCount: number;
  currentMemberCount: number;
  deleted: boolean;
}

interface UserState {
  admin: Admin | null;
  member: Member | null;
  isAuthenticated: boolean;
  organization: Organization | null; 
}

const initialState: UserState = {
  admin: null,
  member: null,
  isAuthenticated: false,
  organization: null, 
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set admin + organization (used for admin logins)
    setAdminUser(state, action: PayloadAction<Admin>) {
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

    setOrganization(state, action: PayloadAction<Organization>) {
      state.organization = action.payload;
    },

    logoutUser(state) {
      state.admin = null;
      state.member = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAdminUser, setMemberUser, logoutUser, setOrganization } = userSlice.actions;
export default userSlice.reducer;
