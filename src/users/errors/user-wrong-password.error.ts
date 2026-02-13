export class UserWrongPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserWrongPasswordError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
