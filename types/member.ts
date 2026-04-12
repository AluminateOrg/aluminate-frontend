export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nic?: string;
  regNo?: string;
  address?: string;
  batch?: number;
  designation?: string;
  company?: string;
  degree?: string;
  avatar?: string;
  is_active: boolean;
  status?: "active" | "pending" | "inactive";
  joinedAt?: string;
  groupIds: number[];
}