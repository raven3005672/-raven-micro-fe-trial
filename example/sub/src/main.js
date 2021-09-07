import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let app

const NotFound = { template: '<p>Page not found</p>' }
const Home = { template: '<p>home page</p>' }
const About = { template: '<p>about page</p>' }

const routes = {
  '/': Home,
  '/about': About
}

export const bootstrap = () => {
  app = new Vue({
    render: (h) => h(App),
  })
}

export const mount = () => {
  app.$mount('#app')
}

export const unmount = () => {
  app.$destroy()
}

new Vue({
  el: '#app',
  data: {
    currentRoute: window.location.pathname
  },
  computed: {
    ViewComponent () {
      return routes[this.currentRoute] || NotFound
    }
  },
  render (h) { return h(this.ViewComponent) }
})