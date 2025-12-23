import 'express-session';

// Augment Express.Request with a user property used by auth guard
declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      username: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

// Augment express-session with user property
declare module 'express-session' {
  interface SessionData {
    user?: Express.UserPayload;
  }
}
