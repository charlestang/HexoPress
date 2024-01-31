import { useAppStoreWithout } from '@/stores/app'
import DashboardView from '@/views/DashboardView.vue'
import MainWindow from '@/views/MainWindow.vue'
import PreferencesView from '@/views/PreferencesView.vue'
import type { App } from 'vue'
import { createRouter, createWebHashHistory, createMemoryHistory } from 'vue-router'
import CategoriesView from '../views/CategoriesView.vue'
import FrameView from '../views/FrameView.vue'
import MediaLibraryView from '../views/MediaLibraryView.vue'
import PostListView from '../views/PostListView.vue'
import SetupView from '../views/SetupView.vue'
import TagsView from '../views/TagsView.vue'

const router = createRouter({
  //history: createWebHashHistory(import.meta.env.BASE_URL),
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      redirect: '/main/dashboard'
    },
    {
      path: '/main',
      name: 'main',
      component: MainWindow,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView
        },
        {
          path: 'tags',
          name: 'tags',
          component: TagsView
        },
        {
          path: 'categories',
          name: 'categories',
          component: CategoriesView
        },
        {
          path: 'post-list',
          name: 'post-list',
          component: PostListView
        },
        {
          path: 'media-library',
          name: 'media-library',
          component: MediaLibraryView
        },
        {
          path: 'preferences',
          name: 'preferences',
          component: PreferencesView
        }
      ]
    },
    {
      path: '/frame',
      name: 'frame',
      component: FrameView,
      props: true
    },
    {
      path: '/setup',
      name: 'setup',
      component: SetupView
    }
  ]
})

const appStore = useAppStoreWithout()

router.beforeEach(async (to, from, next) => {
  if (!(await appStore.isBasePathSet) && to.name !== 'setup') {
    next('/setup')
  } else {
    next()
  }
})

export const setupRouter = (app: App<Element>) => {
  app.use(router)
  router.push({ path: '/' })
}

export default router
