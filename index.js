import OSXTable from './osxtable'
OSXTable.install = function (Vue) {
  console.log("被触发",OSXTable);
  Vue.component(OSXTable.name, OSXTable)
}
export default OSXTable
