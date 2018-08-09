import firebase from 'firebase/app'
import { Loading, Dialog } from 'quasar'
import { getProvider } from 'src/services/firebase/providers/github'

export const getCurrentUser = () => firebase.auth().currentUser

export const unlinkProvider = (currentUser, providerId) => {
  return currentUser.unlink(providerId)
    .catch(() => Promise.resolve(true))
}

export const githubLogin = () => {
  Loading.show({
    message: 'Waiting for GitHub authorization'
  })
  firebase.auth().signInWithPopup(getProvider()).then((result) => {
    console.log(result)
  }).catch(e => {
    console.log(e)
    Dialog.create({
      title: 'Login Error',
      message: 'An error occurred while trying to authenticate your GitHub account.'
    })
  }).finally(() => {
    Loading.hide()
  })
}
