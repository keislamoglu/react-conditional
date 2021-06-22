type StringOrNumber = string | number

export function compareArrays<ItemType = StringOrNumber>(arr1: ItemType[], arr2: ItemType[]): boolean {
  return arr1.length === arr2.length && arr1.every((item) => arr2.includes(item))
}
