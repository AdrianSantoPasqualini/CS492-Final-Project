<template>
  <div>
    <img :src="this.robourl"/>
  </div>
</template>

<script>
export default {
  name: 'RobotSelectionCard',
  data() {
    return {
      robohash: '',
      robourl: '',
    }
  },
  mounted() {
    this.robohash = Math.random();
    this.robourl = 'https://robohash.org/' + this.robohash;
  }
}
</script>