export class CustomError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = data;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFound extends CustomError {
  constructor(message: string, data?: unknown) {
    super(message, 404, data);
  }
}

export class InternalErrorException extends CustomError {
  constructor(message: string, data?: unknown) {
    super(message, 500, data);
  }
}

export class MissingField extends CustomError {
  constructor(message: string, data?: unknown) {
    super(message, 400, data);
  }
}

export class EmptyField extends CustomError {
  constructor(message: string, data?: unknown) {
    super(message, 422, data);
  }
}

export class Conflict extends CustomError {
  constructor(message: string, data?: unknown) {
    super(message, 409, data);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, data?: unknown) {
    super(message, 422, data);
  }
}

export class Unauthorized extends CustomError {
  constructor(message: string, data?: unknown) {
    super(message, 401, data);
  }
}

export class Forbidden extends CustomError {
  constructor(message: string, data?: unknown) {
    super(message, 403, data);
  }
}
