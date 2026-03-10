import {AppSettings} from "../AppSettings.ts";

class AuthenticationService {
  static async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    return await fetch(AppSettings.API_URL + url, options);
  }
}

export default AuthenticationService;