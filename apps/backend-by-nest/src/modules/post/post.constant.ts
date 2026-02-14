export const PostAlias = 'post' as const;

export const PostFields = {
  user: `${PostAlias}.user`,
  publishTime: `${PostAlias}.publishTime`,
  pContent: `${PostAlias}.pContent`,
  isPublic: `${PostAlias}.isPublic`,
  pId: `${PostAlias}.pId`,
  userId: `${PostAlias}.userId`,
  status: `${PostAlias}.status`,
} as const;
