<template lang="pug">
  q-select(
    label="License",
    v-model="project.license",
    :error="$v.project.license.$error",
    placeholder="MIT",
    :options="licenseOptions",
    :before="[{ icon: 'mdi-file-outline' }]",
    filter,
    autofocus-filter,
    @blur="updateFormPercentage('license')"
  )
</template>

<script>
import { QInput } from 'quasar'

export default {
  name: 'u-select-license',
  components: {
    QInput
  },
  props: ['onError', 'updateFormPercentage', 'readonly', 'classes', 'id'],
  computed: {
    allClasses () {
      return 'u-input ' + this.classes
    }
  },
  methods: {
    handleChange (val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="stylus">
  .u-input {
    background #fff
    border solid 1px #e0e2e5
    border-bottom none
    padding-top 8px
    padding-left 10px
    &:before {
      background #e0e2e5
    }
  }
</style>
