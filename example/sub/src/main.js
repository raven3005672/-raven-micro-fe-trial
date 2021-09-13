import Vue from 'vue/dist/vue';
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

export const bootstrap = async () => {
  alert(123)
  app = await new Vue({
    render: (h) => h(App),
  })
}

export const mount = async () => {
  app.$mount('#app')
}

export const unmount = async () => {
  app.$destroy()
}

// bootstrap()
new Vue({
  el: '#test',
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