import { useAppStoreWithout } from '@/stores/app'
import CategoriesView from '@/views/CategoriesView.vue'
import DashboardView from '@/views/DashboardView.vue'
import FrameView from '@/views/FrameView.vue'
import MainWindow from '@/views/MainWindow.vue'
import MediaLibraryView from '@/views/MediaLibraryView.vue'
import PostListView from '@/views/PostListView.vue'
import PreferencesView from '@/views/PreferencesView.vue'
import SetupView from '@/views/SetupView.vue'
import TagsView from '@/views/TagsView.vue'
import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/main/dashboard',
    },
    {
      path: '/main',
      name: 'main',
      component: MainWindow,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'tags',
          name: 'tags',
          component: TagsView,
        },
        {
          path: 'categories',
          name: 'categories',
          component: CategoriesView,
        },
        {
          path: 'post-list',
          name: 'post-list',
          component: PostListView,
        },
        {
          path: 'media-library',
          name: 'media-library',
          component: MediaLibraryView,
        },
        {
          path: 'preferences',
          name: 'preferences',
          component: PreferencesView,
        },
      ],
    },
    {
      path: '/frame',
      name: 'frame',
      component: FrameView,
      props: true,
    },
    {
      path: '/setup',
      name: 'setup',
      component: SetupView,
    },
  ],
})

const appStore = useAppStoreWithout()

router.beforeEach((to, from) => {
  console.log('router: beforeEach')
  console.log('appStore.isBasePathSet: ', appStore.isBasePathSet)
  console.log('appStore.isAgentInitialized: ', appStore.isAgentInitialized)
  if (!appStore.isBasePathSet && to.name !== 'setup') {
    return { path: '/setup' }
  } else {
    if (appStore.isBasePathSet && !appStore.isAgentInitialized) {
      console.log('basePath is set, but agent is not initialized, try to init ....')
      window.site.initializeAgent(appStore.basePath).then((result) => {
        console.log('initializeAgent result: ', result)
        if (result) {
          // initialized successfully, set the flag
          appStore.setAgentInitialized()
          console.log('now destination: ', to)
          console.log('initialized status is:', appStore.isAgentInitialized)
          return true
        } else {
          // initialized failed, reset the basePath and redirect to setup
          appStore.setBasePath('')
          return { path: '/setup' }
        }
      })
    } else {
      console.log('route from: ', from, ' to: ', to)
      return true
    }
  }
})

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
