export const UserAlias = 'user' as const;

export const UserFields = {
  username: `${UserAlias}.username`,
  userAvatar: `${UserAlias}.userAvatar`,
} as const;
