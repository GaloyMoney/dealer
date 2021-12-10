type SimpleObject = { [key: string]: string }

type NestedObject = { [key: string]: string | SimpleObject }

declare interface Window {
  __G_DATA: {
    initialData: NestedObject
  }
}
