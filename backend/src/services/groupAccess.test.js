import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGroupIfMember } from './groupAccess.js';

const mockGroupFindOne = vi.fn();
vi.mock('../models/Group.js', () => ({
  Group: {
    findOne: (...args) => mockGroupFindOne(...args),
  },
}));

describe('getGroupIfMember', () => {
  beforeEach(() => {
    mockGroupFindOne.mockReset();
  });

  it('returns null when groupId is missing', async () => {
    const result = await getGroupIfMember(null, 'user-123');
    expect(result).toBeNull();
    expect(mockGroupFindOne).not.toHaveBeenCalled();
  });

  it('returns null when userId is missing', async () => {
    const result = await getGroupIfMember('group-456', null);
    expect(result).toBeNull();
    expect(mockGroupFindOne).not.toHaveBeenCalled();
  });

  it('returns null when user is not a member', async () => {
    mockGroupFindOne.mockResolvedValue(null);

    const result = await getGroupIfMember('group-456', 'user-123');

    expect(mockGroupFindOne).toHaveBeenCalledWith({
      _id: 'group-456',
      'members.userId': 'user-123',
    });
    expect(result).toBeNull();
  });

  it('returns the group when user is a member', async () => {
    const fakeGroup = { _id: 'group-456', name: 'Test Group' };
    mockGroupFindOne.mockResolvedValue(fakeGroup);

    const result = await getGroupIfMember('group-456', 'user-123');

    expect(mockGroupFindOne).toHaveBeenCalledWith({
      _id: 'group-456',
      'members.userId': 'user-123',
    });
    expect(result).toEqual(fakeGroup);
  });

  it('queries Group using provided groupId and userId values', async () => {
    mockGroupFindOne.mockResolvedValue({ _id: 'any-group' });

    await getGroupIfMember('group-789', 'user-999');

    expect(mockGroupFindOne).toHaveBeenCalledTimes(1);
    expect(mockGroupFindOne).toHaveBeenCalledWith({
      _id: 'group-789',
      'members.userId': 'user-999',
    });
  });
});
