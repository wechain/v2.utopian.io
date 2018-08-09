/**
 * Configure / initialize firebase authentication.
 *
 * @param {firebase.app.App}  firebase  Firebase application instance to configure.
 * @param {Store}             store     Vuex store instance.
 */
/*
const configureAuth = (firebase, store) => {
  // when firebase changes the authentication state, do the following actions.
  firebase.auth().onAuthStateChanged((user) => {
    store.commit('auth/setUser', (user || null))
    console.log(user)
    if ((user && user.uid)) {
      store.dispatch('auth/loadFirebaseAccount', (user.uid))
    }
  })
}

// default export the auth configure function.
export default configureAuth
*/
