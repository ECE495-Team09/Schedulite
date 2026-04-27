import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { requireAuth } from './requireAuth.js';

vi.mock('jsonwebtoken', () => ({
  default: { verify: vi.fn() },
}));

function mockReq(header = '') {
  return { headers: { authorization: header } };
}

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns 401 when Authorization header is missing', () => {
    const req = mockReq('');
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Authorization: Bearer <token>' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is not Bearer type', () => {
    const req = mockReq('Basic abc123');
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Bearer type is provided without a token', () => {
    const req = mockReq('Bearer');
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Authorization: Bearer <token>' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid or expired', () => {
    const req = mockReq('Bearer bad-token');
    const res = mockRes();
    const next = vi.fn();
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and sets req.user when token is valid', () => {
    const req = mockReq('Bearer valid-token');
    const res = mockRes();
    const next = vi.fn();
    const payload = { userId: 'user-123' };
    jwt.verify.mockReturnValue(payload);

    requireAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
