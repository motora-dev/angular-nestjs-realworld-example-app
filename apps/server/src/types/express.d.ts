// Augment Express.Request with a user property used by auth guard
declare namespace Express {
  interface UserPayload {
    id: number;
    publicId: string;
  }

  interface Request {
    user?: UserPayload;
  }
}
