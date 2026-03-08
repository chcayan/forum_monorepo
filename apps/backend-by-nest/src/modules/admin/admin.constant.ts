export const UserLogStatus = {
  postReviewPass: 'post_review_pass',
  postReviewViolate: 'post_review_violate',
  postViolate: 'post_violate',
  commentViolate: 'comment_violate',
  userMute: 'user_mute',
  userPostProhibit: 'user_post_prohibit',
  userLoginProhibit: 'user_login_prohibit',
  systemAnnouncement: 'system_announcement',
} as const;

export type UserLogStatusType =
  (typeof UserLogStatus)[keyof typeof UserLogStatus];

const enum UserProhibition {
  userMute = 'muteUntil',
  userPostProhibit = 'postProhibitUntil',
  userLoginProhibit = 'loginProhibitUntil',
}

export type UserProhibitionType = `${UserProhibition}`;
