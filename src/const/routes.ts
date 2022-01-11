export const controllerPaths = {
  AUTH: 'auth',
  USER: 'user',
  GROUP: 'group',
  MESSAGE: 'message',
  PRIVATE_MESSAGE: 'privateMessage',
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
  SEARCH_USERS: 'searchUsers',
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
  UPDATE_MESSAGE: 'updateMessage',
  DELETE_MESSAGE: 'deleteMessage',
};

export const privateMessagePaths = {
  GET_MESSAGES: 'getMessages',
  CREATE_MESSAGE: 'createMessage',
  UPDATE_MESSAGE: 'updateMessage',
  DELETE_MESSAGE: 'deleteMessage',
};
