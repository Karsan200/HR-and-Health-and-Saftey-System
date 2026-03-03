class AuthenticationService {
  static async fetch(url: string, options: RequestInit): Promise<Response> {
    return await fetch(url, options);
  }
}

export default AuthenticationService;