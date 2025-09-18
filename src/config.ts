import { AuthenticationClient } from "./clients/authentication";
import { FilesClient } from "./clients/files";
import { HttpClient } from "./clients/httpClient";
import { NotificationsClient } from "./clients/notifications";
import { TeamClient } from "./clients/team";

export const API_URL = import.meta.env.VITE_API_URL;

const httpClient = new HttpClient(API_URL);

export const clients = {
  auth: new AuthenticationClient(httpClient),
  team: new TeamClient(httpClient),
  notifications: new NotificationsClient(httpClient),
  files: new FilesClient(httpClient),
};
