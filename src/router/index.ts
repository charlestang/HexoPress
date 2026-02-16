import { site } from '@/bridge'
import { useAppStoreWithout } from '@/stores/app'
import CategoriesView from '@/views/CategoriesView.vue'
import CategoryPostsView from '@/views/CategoryPostsView.vue'
import DashboardView from '@/views/DashboardView.vue'
import FrameView from '@/views/FrameView.vue'
import LoginView from '@/views/LoginView.vue'
import MainWindow from '@/views/MainWindow.vue'
import MediaLibraryView from '@/views/MediaLibraryView.vue'
import MediaDetailView from '@/views/MediaDetailView.vue'
import PostListView from '@/views/PostListView.vue'
import PreferencesView from '@/views/PreferencesView.vue'
import SetupView from '@/views/SetupView.vue'
import TagsView from '@/views/TagsView.vue'
import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const isWebMode = import.meta.env.VITE_APP_MODE === 'web'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/main/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
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
          path: 'categories/:categoryId',
          name: 'category-detail',
          component: CategoryPostsView,
          props: true,
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
          path: 'media-library/:groupKey',
          name: 'media-detail',
          component: MediaDetailView,
          props: true,
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

router.beforeEach(async (to) => {
  // Web mode: check auth before anything else
  if (isWebMode && to.name !== 'login') {
    try {
      const res = await fetch('/api/auth/check')
      if (!res.ok) {
        return { name: 'login' }
      }
    } catch {
      return { name: 'login' }
    }
  }

  // Web mode: skip directory check (path is configured server-side)
  if (isWebMode) {
    if (to.name !== 'login' && !appStore.isAgentInitialized) {
      try {
        const result = await site.initializeAgent('')
        if (result) {
          appStore.setAgentInitialized()
          const info = await site.getSiteInfo()
          if (info?.basePath) {
            appStore.setBasePath(info.basePath)
          }
        }
      } catch {
        // Agent init failed (e.g. server not ready) — continue anyway
      }
    }
    return true
  }

  // Electron mode: original logic
  if (!appStore.isBasePathSet && to.name !== 'setup') {
    return { path: '/setup' }
  }

  if (appStore.isBasePathSet && !appStore.isAgentInitialized) {
    const result = await site.initializeAgent(appStore.basePath)
    if (result) {
      appStore.setAgentInitialized()
      return true
    } else {
      appStore.setBasePath('')
      return { path: '/setup' }
    }
  }

  return true
})

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
