///define an enum to store user login state
const AUTH_STATUS = {
    CHECKING:"checking",
    LOGGED_IN:"logged_in",
    LOGGED_OUT:"logged_out"
  }
  //AUTH_STATUS enum values should not be changed
  Object.freeze(AUTH_STATUS)

export default AUTH_STATUS;