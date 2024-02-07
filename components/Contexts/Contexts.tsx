import { IRequest, IUser } from "@/types";
import { createContext } from "react";

export const UserContext = createContext<{
  user?: IUser;
  setUser?: React.Dispatch<React.SetStateAction<IUser>>;
}>({});

export const RequestContext = createContext<{
  activeRequest?: {
    request?: IRequest;
    role?: "NAJI" | "NASAKH";
  };
  setActiveRequest?: React.Dispatch<
    React.SetStateAction<{
      request?: IRequest;
      role?: "NAJI" | "NASAKH";
    }>
  >;
}>({});

export const RequestsContext = createContext<{
  requests?: IRequest[];
  setRequests?: React.Dispatch<React.SetStateAction<IRequest[]>>;
}>({});
