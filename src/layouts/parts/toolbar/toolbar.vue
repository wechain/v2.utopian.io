<script>
import { mapGetters, mapActions } from 'vuex'
import { popupLogin } from 'src/services/steem/connect/auth'
import { githubLogin } from 'src/services/firebase/auth'

export default {
  name: 'u-layout-toolbar',
  data () {
    return {
      overlay: null
    }
  },
  computed: {
    ...mapGetters('auth', [
      'guest',
      'user',
      'account',
      'github',
      'githubUsername',
      'username',
      'avatar',
      'githubGuest'
    ]),
    ...mapGetters('common', [
      'isMobile',
      'isDesktop'
    ]),
    createLabel () {
      return this.isDesktop ? 'Contribution' : ''
    }
  },
  methods: {
    ...mapActions([
      'showDialog',
      'startLoading',
      'updateLoading',
      'stopLoading'
    ]),
    ...mapActions('auth', [
      'logout',
      'login',
      'logoutFromSteem',
      'linkGithubAccount'
    ]),
    startGithubLink () {
      // start the loading overlay.
      this.startLoading('Linking Github Account...')
      // call the popup for steem connect authorization.
      return this.linkGithubAccount()
        // handle errors.
        .catch((e) => {
          this.showDialog({ title: 'Oops', 'message': 'Error while linking Github Account.' })
        })
        // finish by stop loading.
        .finally(() => {
          // finish loading.
          this.stopLoading()
        })
    },
    startLoginPopup () {
      githubLogin()
    },
    startPopup () {
      // start the loading overlay.
      this.startLoading('Awaiting authorization...')
      // call the popup for steem connect authorization.
      return popupLogin()
        // handle success.
        .then((result) => {
          // update the loading message to "processing".
          this.startLoading('Processing login...')
          // use the authorization callback to log the user in.
          return this.login(result)
        })
        // handle errors.
        .catch((e) => {
          this.showDialog({ title: 'Oops', 'message': 'An error occurred while trying to authenticate.' })
        })
        // finish by stop loading.
        .finally(() => {
          // finish loading.
          this.stopLoading()
        })
    },
    // redirect to create route.
    redirectToCreate () {
      return this.$router.push({ name: 'create' })
    }
  }
}
</script>

<!-- component template. -->
<template src="./toolbar.pug" lang="pug"></template>

<!-- component styles. -->
<style src="./toolbar.styl" lang="stylus"></style>
