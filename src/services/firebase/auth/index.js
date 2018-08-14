import firebase from 'firebase/app'
import store from 'src/store'
import { Loading, Dialog } from 'quasar'
import { getProvider } from 'src/services/firebase/providers/github'

export const getCurrentUser = () => firebase.auth().currentUser

export const githubLogin = async () => {
  Loading.show({
    message: 'Waiting for GitHub authorization'
  })
  try {
    const githubResponse = await firebase.auth().signInWithPopup(getProvider())
    const login = firebase.functions().httpsCallable('api/auth/login')
    const response = await login(githubResponse.credential)
    store.commit('auth/setUser', response.data, { root: true })
  } catch (e) {
    console.log(e)
    Dialog.create({
      title: 'Login Error',
      message: 'An error occurred while trying to authenticate your GitHub account.'
    })
  } finally {
    Loading.hide()
  }
}
