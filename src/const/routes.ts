export const controllerPaths = {
  AUTH: 'auth',
  USER: 'user',
  GROUP: 'group',
  MESSAGE: 'message',
};

export const authPaths = {
  LOGIN: 'login',
  REGISTRATION: 'registration',
  LOGOUT: 'logout',
};

export const userPaths = {
  GET_USER: 'getUser',
  UPDATE_USER: 'updateUser',
  UPDATE_AVATAR: 'updateAvatar',
};

export const groupPaths = {
  GET_GROUPS: 'getGroups',
  CREATE_GROUP: 'createGroup',
  UPDATE_GROUP: 'updateGroup',
  UPDATE_AVATAR: 'updateAvatar',
  JOIN_GROUP: 'joinGroup',
  LEAVE_FROM_GROUP: 'leaveGroup',
  SEARCH_GROUPS: 'searchGroups',
};

export const messagePaths = {
  GET_MESSAGES_FOR_GROUP: 'getMessagesForGroup',
  CREATE_MESSAGE: 'createMessage',
};
