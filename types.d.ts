export interface IUser {
  name?: string;
  id?: string;
  token?: string;
  UserAsNajiRequests?: IRequest[] | null;
  UserAsNasakhRequests?: IRequest[] | null;
}

export interface IRequest {
  id: string;
  amount: number;
  lat: number;
  long: number;
  naji?: {
    id?: string;
    name?: string;
  };
  nasakh: {
    id: string;
    name: string;
  };
  status: "BRINGING" | "SEARCHING" | "DONE" | "CANCELED";
}
