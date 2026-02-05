export const UserAlias = 'user' as const;

export const UserFields = {
  username: `${UserAlias}.username`,
  userAvatar: `${UserAlias}.userAvatar`,
  userPassword: `${UserAlias}.userPassword`,
  userEmail: `${UserAlias}.userEmail`,
} as const;
