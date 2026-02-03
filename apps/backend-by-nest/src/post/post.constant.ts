export const PostAlias = 'post' as const;

export const PostFields = {
  user: `${PostAlias}.user`,
  publishTime: `${PostAlias}.publishTime`,
} as const;
