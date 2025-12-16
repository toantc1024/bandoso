export type LoginResponse = {
  email: string;
  role: "root" | "admin";
  account_id: string;
};
