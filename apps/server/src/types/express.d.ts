import 'express-session';

// Augment Express.Request with a user property used by auth guard
declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      publicId: string;
      username: string;
    }

    interface PendingRegistration {
      provider: string;
      sub: string;
      email: string;
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
    pendingRegistration?: Express.PendingRegistration;
  }
}
