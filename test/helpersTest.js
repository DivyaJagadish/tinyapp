const { assert } = require('chai');

const  userAlreadyRegistered = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user =userAlreadyRegistered("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user["id"],expectedOutput);
  });
  it('should return undefined', function() {
    const user =userAlreadyRegistered("user3@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user,expectedOutput);
  });
});