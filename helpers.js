//check userAlreadyregistered and returns user object  if registered and returns  undefined if registered.
const userAlreadyRegistered = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined ;
}

module.exports = userAlreadyRegistered;