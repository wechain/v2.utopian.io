<script>
import ULayoutPage from 'src/layouts/parts/page/page'
import firebase from 'firebase/app'

export default {
  name: 'PageProjectContributors',
  components: {
    ULayoutPage
  },
  data () {
    return {
      loading: true,
      contributors: [
        { id: 1, name: 'icaro', numberOfContributions: 17 },
        { id: 2, name: 'hernandev', numberOfContributions: 23 },
        { id: 3, name: 'elear', numberOfContributions: 12 },
        { id: 4, name: 'espoem', numberOfContributions: 91 },
        { id: 5, name: 'mkt', numberOfContributions: 21 }
      ]
    }
  },
  methods: {
    async loadInitial () {
      this.loading = true
      const call = firebase.functions().httpsCallable(`/api/projects/contributors?q=${this.$route.params.name}`)
      await call()
        .then((result) => {
          this.contributors = result.data
        })
        .catch((err) => console.log(err))
      console.log(this.contributors)
    }
  },
  mounted () {
    this.loadInitial()
    return true
  }
}

</script>

<style lang="stylus" src="./contributors.styl"></style>

<template lang="pug" src="./contributors.pug"></template>
