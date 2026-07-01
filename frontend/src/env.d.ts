/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'element-plus' {
  export * from 'element-plus'
}

declare const ElMessage: {
  success(msg: string): void
  warning(msg: string): void
  error(msg: string): void
  info(msg: string): void
}
