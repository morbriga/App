// הגדרת סוגי שגיאות למערכת
export class ApiError extends Error {
  constructor(message, status = 500, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export class AuthError extends ApiError {
  constructor(message = 'אין הרשאה לבצע פעולה זו', details = {}) {
    super(message, 403, details);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'המשאב', details = {}) {
    super(`${resource} לא נמצא`, 404, details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'נתונים לא תקינים', details = {}) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class ServerError extends ApiError {
  constructor(message = 'שגיאת שרת פנימית', details = {}) {
    super(message, 500, details);
    this.name = 'ServerError';
  }
}