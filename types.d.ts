export interface IUser {
  name?: string;
  id?: string;
  token?: string;
  UserAsNajiRequests?: IRequest[];
  UserAsNasakhRequests?: IRequest[];
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
