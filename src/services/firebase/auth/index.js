import firebase from 'firebase/app'
import { Loading, Dialog } from 'quasar'
import { getProvider } from 'src/services/firebase/providers/github'

export const githubLogin = async () => {
  Loading.show({
    message: 'Waiting for GitHub authorization'
  })
  try {
    await firebase.auth().signInWithPopup(getProvider())
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      Dialog.create({
        title: 'Login Error',
        message: `An error occurred while trying to authenticate your GitHub account. Code: ${e.code}`
      })
    }
  } finally {
    Loading.hide()
  }
}
