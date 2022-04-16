const userRoutes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.addNewUserHandler,
  }
];

module.exports = userRoutes;
