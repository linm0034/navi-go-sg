export type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

export type TokenResponse = {
  token: string;
};

export type Reward = {
  points: number;
  history: {
    delta: number;
    reason: string;
    at: string;
  }[];
};