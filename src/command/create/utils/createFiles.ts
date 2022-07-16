import { promises as fs } from 'fs'
import path from 'path'
import { PROJECT_PATH } from 'src/constant'
import { CreateCommandClass } from '..'
import { CreateAnswer, USE_CSS_PREPROCESSOR, USE_ESLINT, USE_FRAME, USE_TS } from '../utils/type'

export function createHtml(this: CreateCommandClass, answer: CreateAnswer) {
  const template = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>${this.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index"></script>
  </body>
  </html>`

  return fs.writeFile(path.join(this.projectPath, 'index.html'), template)

}

export function createPackage(this: CreateCommandClass, answer: CreateAnswer) {

  const base = {
    'name':    this.projectName,
    'version': '1.0.0',
    'scripts': {
      'start': 'vite',
      'build': 'vite build'
    },
    'dependencies': {
    },
    'devDependencies': {
      'vite': '2.7.3'
    }
  }

  // 安装基本库
  switch (answer[0]) {
    case USE_FRAME.VUE2:
      base.dependencies['vue'] = '2.6.14'
      base.devDependencies['vite-plugin-vue2'] = '1.8.0'
      base.devDependencies['vue-template-compiler'] = '2.6.14'
      break
    case USE_FRAME.VUE3:
      base.dependencies['vue'] = base.devDependencies['@vue/compiler-sfc'] = '3.2.26'
      base.devDependencies['@vitejs/plugin-vue'] = '2.0.1'
      break
    case USE_FRAME.REACT17:
      base.dependencies['react'] = base.dependencies['react-dom'] = '17.0.2'
      base.devDependencies['@vitejs/plugin-react-refresh'] = '1.3.6'
      if (answer[1] === USE_TS.YES) {
        base.devDependencies['@types/react'] = '17.0.38'
        base.devDependencies['@types/react-dom'] = '17.0.11'
      }
      break
    case USE_FRAME.REACT18:
      base.dependencies['react'] = base.dependencies['react-dom'] = 'next'
      base.devDependencies['@vitejs/plugin-react-refresh'] = '1.3.6'
      if (answer[1] === USE_TS.YES) {
        base.devDependencies['@types/react'] = '18.0.15'
        base.devDependencies['@types/react-dom'] = '18.0.6'
      }
      break
  }

  // 安装ts
  if (answer[1] === USE_TS.YES) {
    base.devDependencies['typescript'] = '4.3.5'
  }

  // 安装eslint
  if (answer[2] === USE_ESLINT.YES) {
    base.devDependencies['@typescript-eslint/parser'] = '4.15.2'
    base.devDependencies['eslint'] = '7.20.0'
  }

  // 安装预编译器
  if (answer[3] === USE_CSS_PREPROCESSOR.LESS) {
    base.devDependencies['less'] = '4.1.2'
  } else if (answer[3] === USE_CSS_PREPROCESSOR.SCSS) {
    base.devDependencies['sass'] = '1.45.2'
  }

  return fs.writeFile(path.join(this.projectPath, 'package.json'), JSON.stringify(base, null, 2))

}

export function createTsConfig(this: CreateCommandClass, answer: CreateAnswer) {

  if (answer[1] === USE_TS.YES) {
    const base = {
      'compilerOptions': {
        'lib': [
          'dom',
          'dom.iterable',
          'esnext'
        ],
        'downlevelIteration':               true,
        'noImplicitAny':                    false,
        'allowJs':                          true,
        'skipLibCheck':                     true,
        'allowSyntheticDefaultImports':     true,
        'strict':                           true,
        'forceConsistentCasingInFileNames': true,
        'moduleResolution':                 'node',
        'experimentalDecorators':           true,
        'resolveJsonModule':                true,
        'isolatedModules':                  true,
        'esModuleInterop':                  true,
        'declaration':                      false,
        'baseUrl':                          './',
        'paths':                            {
          'src/*': [
            'src/*'
          ]
        }
      },
      'exclude': [
        'node_modules'
      ],
      'include': [
        'src/**/*'
      ]
    }

    if (answer[0] === USE_FRAME.REACT17 || answer[0] === USE_FRAME.REACT18) {
      base.compilerOptions['jsx'] = 'react-jsx'
    }

    return fs.writeFile(
      path.join(this.projectPath, 'tsconfig.json'),
      JSON.stringify(base, null, 2)
    )

  }

}

const vue2Index = `import Vue from 'vue'
import App from './App.vue'

new Vue({
  render: h=>h(App)
}).$mount('#root')`
const vue2App = `<template>
  <div>
    Hello
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {

  }
}
</script>

<style scoped>
</style>`
const vue3Index = (isTs: boolean) => `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount(document.querySelector('#root')${isTs ? '!' : ''})`
const vue3App = `<template>
  <div>
    hello
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>`
const react17Index = (isTs: boolean)=>{
  return `import ReactDom from 'react-dom'
import App from './App'

ReactDom.render(<App />, document.querySelector('#root')${isTs ? '!' : ''})`
}
const reactApp = `export default function () {
  return (
    <div>
      Hello
    </div>
  )
}`
const react18Index = (isTs: Boolean)=>{
  return `import ReactDom from 'react-dom/client'
import App from './App'

ReactDom.createRoot(document.querySelector('#root')${isTs ? '!' : ''}).render(<App />)`
}
const viteEnv = `// 兼容资源
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'
declare module '*.vue'

declare const isDev: boolean`

export async function createSrc(this: CreateCommandClass, answer: CreateAnswer) {
  // 创建src文件夹
  const srcPath = path.join(this.projectPath, 'src')
  await fs.mkdir(srcPath)

  // 保存要写入的文件 
  const files: Record<string, string> = {}

  const isTs = answer[1] === USE_TS.YES

  // 生成文件
  switch (answer[0]) {
    case USE_FRAME.VUE2:
      files[`index.${isTs ? 'ts' : 'js'}`] = vue2Index
      files['App.vue'] = vue2App
      break
    case USE_FRAME.VUE3:
      files[`index.${isTs ? 'ts' : 'js'}`] = vue3Index(isTs)
      files['App.vue'] = vue3App
      break
    case USE_FRAME.REACT17:
      files[`index.${isTs ? 'tsx' : 'jsx'}`] = react17Index(isTs)
      files[`App.${isTs ? 'tsx' : 'jsx'}`] = reactApp
      break
    case USE_FRAME.REACT18:
      files[`index.${isTs ? 'tsx' : 'jsx'}`] = react18Index(isTs)
      files[`App.${isTs ? 'tsx' : 'jsx'}`] = reactApp
      break
  }

  if (isTs) {
    files['vite-env.d.ts'] = viteEnv
  }

  const keys = Object.keys(files)

  for (let file of keys) {
    const filePath = path.join(srcPath, file)
    await fs.writeFile(filePath, files[file])
  }

}

export function createViteConfig(this: CreateCommandClass, answer: CreateAnswer) {

  let framePlugin = ''
  let usePlugin = ''
  let esbuild = ''

  // 基本库判断
  switch (answer[0]) {
    case USE_FRAME.VUE2:
      framePlugin = 'import { createVuePlugin } from \'vite-plugin-vue2\''
      usePlugin = 'createVuePlugin()'
      break
    case USE_FRAME.VUE3:
      framePlugin = 'import vue from \'@vitejs/plugin-vue\''
      usePlugin = 'vue()'
      break
    case USE_FRAME.REACT17:
    case USE_FRAME.REACT18:
      framePlugin = 'import reactRefresh from \'@vitejs/plugin-react-refresh\''
      esbuild = `
      esbuild: {
        jsxInject: 'import React from \\'react\\''
      },`
      usePlugin = 'reactRefresh()'
      break
  }

  const base = `import path from 'path'
import { defineConfig } from 'vite'
${framePlugin}

export default defineConfig(function (env) {

  const isDev = env.command !== 'build'

  return {
    define: {
      isDev
    },
    resolve: {
      alias: {
        'src': path.join(__dirname, './src')
      }
    },${esbuild}
    plugins: [
      ${usePlugin}
    ]
  }
})`

  return fs.writeFile(path.join(this.projectPath, `vite.config.${answer[1] === USE_TS.YES ? 'ts' : 'js'}`), base)

}

export function createEslint(this: CreateCommandClass, answer: CreateAnswer){
  return fs.copyFile(
    path.join(PROJECT_PATH, './.eslintrc.js'),
    path.join(this.projectPath, './.eslintrc.js')
  )
}