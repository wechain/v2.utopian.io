import firebase from 'firebase/app'

export const getProvider = () => {
  const provider = new firebase.auth.GithubAuthProvider()
  provider.addScope('read:org')
  provider.addScope('repo')
  return provider
}

export default getProvider
