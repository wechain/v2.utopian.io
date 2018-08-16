<script>
// imports.
import ULayoutPage from 'src/layouts/parts/page/page'
import UFileUploader from 'src/components/form/file-uploader'
import USelectLicense from 'src/components/form/select-license'

import { required, minLength } from 'vuelidate/lib/validators'
import { mapGetters, mapActions } from 'vuex'
import firebase from 'firebase/app'
import { uniq } from 'lodash-es'

// create project component export.
export default {

  // component name.
  name: 'u-page-crud-project',

  // child components.
  components: {
    ULayoutPage,
    UFileUploader,
    USelectLicense
  },

  // component data.
  data () {
    return {
      ...mapGetters('auth', [
        'account',
        'username'
      ]),

      ...mapGetters('common', [
        'isMobile',
        'isDesktop'
      ]),

      formPercentage: 0,

      isAllowed: false,
      isMounted: false,

      // project internal data.
      project: {
        id: '', // auto generated
        name: '', // project name.
        description: '', // project description (short).
        featured: false, // should project be featured in homepage
        creator: '', // primary owner / creator of the project.
        images: [], // project image
        details: '', // project detail
        tags: [], // project tags
        blacklisted: false, // when blacklisted, no submissions should be made.
        openSource: true, // is project open source or not?.
        platforms: {
          github: {
            id: null,
            repository: ''
          }
        }, // on which platform is the project
        slug: '', // project slug (preferable to use github vendor/repo for slug).
        website: '', // project website.
        docs: '', // project documentation URL.
        license: '', // project license code (lower case: mit, bsd, apache).
        status: 'active' // owner or staff provided status (abandoned, active).
      }
    }
  },

  // component validations.
  validations: {
    project: {
      name: { required },
      description: { required },
      images: {
        required,
        minLength: minLength(1)
      },
      details: { required },
      license: { required },
      tags: {
        required,
        minLength: minLength(3)
      },
      platforms: {
        github: (value, vm) => vm.openSource ? value.github.repository !== '' : true
      },
      website: {},
      docs: {}
    }
  },

  // component methods.
  methods: {
    ...mapActions([
      'showDialog',
      'startLoading',
      'updateLoading',
      'stopLoading',
      'decrypt'
    ]),
    ...mapActions({
      loadCredentials: 'auth/loadCredentials',
      searchGithubRepository: 'github/searchGithubRepository',
      checkProjectCollaborator: 'github/checkProjectCollaborator',
      authenticate: 'github/authenticate'
    }),
    async submit () {
      this.$v.project.$touch()

      this.project.slug = this.getProjectSlug()
      this.project.id = this.project.slug.split('/').pop()
      this.project.creator = this.username()

      if (!this.project.slug) {
        this.showDialog({ title: 'Oops :(', message: 'An error occured. Please review the form.' })
        return
      }
      if (this.$v.project.$error) {
        this.showDialog({ title: 'Oops :(', message: 'Please review the form.' })
        return
      }
      if (this.project.platforms.github.repository && !this.isAllowed) {
        this.showDialog({ title: 'Oops :(', message: 'You must be the owner of the GitHub project.' })
        return
      }
      if (!this.project.platforms.github.repository) {
        this.project.openSource = false
      } else {
        // send token to validate repo ownership in the backend. token is not stored
        const encryptedToken = await this.loadCredentials('github')
        this.project.platforms.github.token = await this.decrypt(encryptedToken.secret)
      }

      this.startLoading('Saving your project')
      const method = this.isEditing ? 'edit' : 'create' 
      
      const call = firebase.functions().httpsCallable(`api/projects/${method}`)
      return call(this.project)
        .then(() => {
          this.stopLoading()
          return this.$router.push({ name: 'project.details', params: { name: this.project.id } })
        }).catch(() => {
          this.stopLoading()
          this.showDialog({ title: 'Oops :(', message: 'We couldn\'t save your project. Please try again' })
        })
    },
    searchGithubRepos (query, done) {
      this.searchGithubRepository(query).then(done)
    },
    async checkProjectOwner () {
      const splittedGithubRepository = this.project.platforms.github.repository.split('/')
      const repo = splittedGithubRepository.pop()
      const owner = splittedGithubRepository.pop()
      const username = this.github.username

      let userPermision = 'none'
      try {
        userPermision = (await this.checkProjectCollaborator({ owner, repo, username })).data.permission
      } catch (err) {
        return false
      }

      return userPermision === 'admin'
    },
    selectGithubRepo (repo) {
      this.project.githubRepository = repo
      this.$refs.autocomplete.setValue(repo)
      this.checkProjectOwner()
    },
    selectLicense (license) {
      this.project.license = license
    },
    splitTags () {
      const vm = this
      if (vm.project.tags.length === 1) {
        setTimeout(() => {
          vm.project.tags = uniq(vm.project.tags[0].split(',').map(tag => tag.trim()))
        }, 0)
      }
    },
    slugify (str) {
      str = str.replace(/^\s+|\s+$/g, '') // trim
      str = str.toLowerCase()

      // remove accents, swap ñ for n, etc
      const from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;'
      const to = 'aaaaaeeeeeiiiiooooouuuunc------'
      for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
      }

      str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-') // collapse dashes

      return str
    },
    getProjectSlug () {
      return this.project.platforms.github.repository
        ? this.project.platforms.github.repository : `${this.username()}/${this.slugify(this.project.name)}`
    },
    updateFormPercentage (field) {
      this.$v.project[field].$touch()
      const fields = Object.keys(this.$v.project.$params)
      const totalOfFields = fields.length
      let completed = 0
      for (let key in this.$v.project.$params) {
        if (this.$v.project[key].$dirty && !(this.$v.project[key].$invalid || this.$v.project[key].$error)) {
          completed++
        }
      }
      this.formPercentage = Math.round(completed / totalOfFields * 100)
    },
    checkGithubField () {
      if (this.closedSource) {
        this.project.platforms.github = { id: null, repository: '' }
      }
    },
    handleImageUpload (uploadUrl) {
      this.updateFormPercentage('images')
      this.project.images = [uploadUrl]
    },
    loadProject () {
      const projectsRef = this.firestore.collection('projects')

      return projectsRef.where('id', '==', this.$route.params.name)
        .get()
        .then((querySnapshot) => {
          this.project = querySnapshot.docs[0].data()
          
          this.project.tags = Object.values(this.project.tags)
        })
    },
    setSideBoxWidth () {
      console.log(this.$refs.sideBox, document.getElementById('sideBox'))
      if (document.getElementById('sideBox') && this.$refs.sideBox) {
        document
          .getElementById('sideBox')
          .setAttribute('style', `width: ${this.$refs.sideBox.parentNode.clientWidth}px`)
      }
    }
  },
  computed: {
    closedSource: {
      get () {
        return !this.project.openSource
      },
      set () {
        this.project.openSource = !this.project.openSource
      }
    },
    isEditing () {
      return this.$route.params.name
    }
  },
  async mounted () {
    this.isMounted = true
    this.$nextTick(() => {
      this.setSideBoxWidth()
    })

    if (this.isEditing) {
      try {
        await this.loadProject(this.$route.params.name)
        if (this.github && this.github.username) {
          this.isAllowed = await this.checkProjectOwner()
          if (!this.isAllowed) {
            this.showDialog({ title: 'Oops :(', message: 'You don\'t have permision to edit this project.' })
            return this.$router.push({ name: 'not-found' })
          }
        }
      } catch (err) {
        this.showDialog({ title: 'Oops :(', message: 'You don\'t have permision to edit this project.' })
        return this.$router.push({ name: 'not-found' })
      }
    }
  }
}
</script>

<style lang="stylus" src="./crud-project.styl"></style>

<template lang="pug" src="./crud-project.pug"></template>
