<template>
  <div id="app">
    <LandingPage />
  </div>
</template>

<script>
import LandingPage from './components/LandingPage.vue';

export default {
  name: 'App',
  components: {
    LandingPage
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

body {
  background: #fe9c8f;
}

button {
  display: inline-block;
  padding: 0.35em 1.2em;
  border:0.115em solid #feb2a8;
  border-radius:0.15em;
  box-sizing: border-box;
  text-decoration:none;
  font-family:'Roboto',sans-serif;
  font-weight: 500;
  color: #ffffff;
  background-color:#f9caa7;
  text-align:center;
  transition: all 0.2s;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 1rem;
}

button:hover{
  color:white;
  cursor: pointer;
  background-color:#feb2a8;
}
@media all and (max-width:30em){
  button{
    display:block;
    margin:0.4em auto;
  }
}
</style>
