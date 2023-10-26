import DashboardView from '@/views/DashboardView.vue'
import MainWindow from '@/views/MainWindow.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import CategoriesView from '../views/CategoriesView.vue'
import EditorView from '../views/EditorView.vue'
import PostListView from '../views/PostListView.vue'
import SetupView from '../views/SetupView.vue'
import TagsView from '../views/TagsView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
        }
      ]
    },
    {
      path: '/editor/:sourcePath',
      name: 'editor',
      component: EditorView,
      props: true
    },
    {
      path: '/setup',
      name: 'setup',
      component: SetupView
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const vaultPath = await window.site.getConfig('vaultPath')
  console.log(vaultPath)
  if (vaultPath === null && to.name !== 'setup') {
    console.log('redirecting to setup')
    next('/setup')
  } else {
    next()
  }
})

export default router
