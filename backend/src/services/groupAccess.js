// backend/src/services/groupAccess.js
// Shared helpers for validating group membership (query scoping).

import { Group } from "../models/Group.js";

/**
 * Returns the group if the user is a member, otherwise null.
 * Use this to ensure no route returns or mutates group/event data without membership.
 * @param {string|import('mongoose').Types.ObjectId} groupId
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<import('mongoose').Document|null>}
 */
export async function getGroupIfMember(groupId, userId) {
  if (!groupId || !userId) return null;
  const group = await Group.findOne({
    _id: groupId,
    "members.userId": userId,
  });
  return group;
}
