<template>
  <ul id="menu" ref="menu">
    <li @mouseenter="showAddMenu=true" @mouseleave="showAddMenu=false">
      新增操作
      <i class="fa fa-chevron-right"></i>
        <ul v-show="showAddMenu" class="addOperator" ref="showAddMenu">
          <li v-for="(item,key) in addMenus" :key="key" @click="addNewOne(key,$event)">{{item}}</li>
        </ul>

    </li>
    <li @mouseover="showDeleteMenu=true" @mouseout="showDeleteMenu=false">
      删除操作
      <i class="fa fa-chevron-right"></i>
        <ul class="deleteOperator" v-show="showDeleteMenu" ref="showDeleteMenu">
          <li v-for="(item,key) in deleteMenus" :key="key" @click="deleteOne(key,$event)">{{item}}</li>
        </ul>
    </li>

    <li @mouseenter="showAlignMenu=true" @mouseleave="showAlignMenu=false">
      对齐方式
      <i class="fa fa-chevron-right"></i>
        <ul class="showAlignMenu" v-show="showAlignMenu" ref="showAlignMenu">
          <li
            v-for="(item,key) in alignMenus"
            :key="key"
            @mouseenter="showAlignChilren=true,hoverIndex=key"
            @mouseleave="showAlignChilren=false"
          >
            {{item.title}}
            <i class="fa fa-chevron-right"></i>
            <ul class="alignMenu" v-show="showAlignChilren&&hoverIndex==key" ref="alignMenu">
              <li
                v-for="(align,itemIndex) in item.children"
                :key="itemIndex"
                @click="changeAlign(key,align)"
              >{{align.title}}</li>
            </ul>
          </li>
        </ul>
    </li>
    <li @click="mergeTd(),hideMenu()">合并单元格</li>
    <li @click.stop="$emit('update:isOpenCssDialog',true)">其他样式</li>
  </ul>
</template>

<script>
import colorpicker from "./colorpicker";
export default {
  components: { colorpicker },
  props: {
    tableInfo: {
      type: Object,
      default: () => {
        return {
          rowIndex: 0,
          colIndex: 0
        };
      }
    },
    mergeList: {
      type: Array,
      default: ()=>{[]}
    },
    rowspan: {
      type: Number,
      default: 0
    },
    colspan: {
      type: Number,
      default: 0
    },
    slideDirection: {
      type: Number,
      default: 0
    },
    isOpenCssDialog: {
      type:Boolean,
      default: false
    }
  },
  data() {
    return {
      showAddMenu: false,
      showDeleteMenu: false,
      showAlignMenu: false,
      showAlignChilren: false,
      showTrStyle: false,
      showColorPicker: false,
      showOddEvenStyle:false,
      showCurrentRowStyle:false,
      hoverIndex: 0,
      colorObj: {},
      oddColorObj: { color: "lightgray" },
      evenColorObject: { color: "lightcyan" },
      addMenus: [
        "在前面添加一行",
        "在后面添加一行",
        "在前面添加一列",
        "在后面添加一列"
      ],
      deleteMenus: [
        "删除当前行",
        "删除当前列",
        "删除前一行",
        "删除后一行",
        "删除前一列",
        "删除后一列",
        "删除表格"
      ],
      alignMenus: [
        {
          title: "单元格对齐",
          children: [
            { title: "居左", style: { "text-align": "left" } },
            { title: "居中", style: { "text-align": "center" } },
            { title: "居右", style: { "text-align": "right" } }
          ]
        },
        {
          title: "列对齐",
          children: [
            { title: "居左", style: { "text-align": "left" } },
            { title: "居中", style: { "text-align": "center" } },
            { title: "居右", style: { "text-align": "right" } }
          ]
        },
        {
          title: "行对齐",
          children: [
            { title: "居左", style: { "text-align": "left" } },
            { title: "居中", style: { "text-align": "center" } },
            { title: "居右", style: { "text-align": "right" } }
          ]
        }
      ],
      table: {},
      tableStyleObject: {},//表格样式对象
    };
  },
  watch: {
    tableInfo: {
      deep: true,
      handler(newValue) {}
    },
    mergeList:{
      deep: true,
      handler(newValue){
        console.log("要合并的单元格",newValue);
      }
    },
    slideDirection(){
      console.log("***************方向发生改变");
       const menuList = this.$refs['showAddMenu'];
      const showDeleteMenu = this.$refs['showDeleteMenu'];
      const showAlignMenu = this.$refs['showAlignMenu'];
      const alignMenus = this.$refs['alignMenu'];
      if(menuList){
          if(this.slideDirection < 300){
            menuList.style.marginLeft = "-100px";
            showAlignMenu.style.marginLeft = "-100px"
            // alignMenu.style.marginLeft = "-200px";
            showDeleteMenu.style.marginLeft = "-100px"
             for(let i=0;i<alignMenus.length;i++){
              const item = alignMenus[i];
              item.style.marginLeft = "-100px"
            }
          }else{
            menuList.style.marginLeft = "100px";
            showDeleteMenu.style.marginLeft = "100px"
            showAlignMenu.style.marginLeft = "100px"  
          }
      }
    }
  },
  methods: {
    addNewOne(index, event) {
      const table = this.$parent.$refs["richEdit"].children[0];
      const tbody = table.children[0];
      this.table = table;
      console.log("table---------",[table]);
      const tr = tbody.children[this.tableInfo.rowIndex];
      const td = tr.children[this.tableInfo.colIndex];
      switch (index) {
        case 0:
          var newTr = tr.cloneNode(true);
          Array.from(newTr.children).forEach(item => {
            item.innerHTML = "-";
          });
          tr.parentElement.insertBefore(newTr, tr);
          break;
        case 1:
          var newTr = tr.cloneNode(true);
          Array.from(newTr.children).forEach(item => {
            item.innerHTML = "-";
          });
          this.insertAfter(newTr, tr);
          break;
        case 2:
          this.insertTd("before");
          break;
        default:
          this.insertTd("after");
          break;
      }
      this.$refs['menu'].style.display = "none";
      this.$parent.changeHTML();
    },
    insertAfter(newEl, targetEl) {
      var parentEl = targetEl.parentNode;
      if (parentEl.lastChild === targetEl) {
        parentEl.appendChild(newEl);
      } else {
        parentEl.insertBefore(newEl, targetEl.nextSibling);
      }
    },
    insertTd(direction) {
      const table = this.$parent.$refs["richEdit"].children[0];
      const tbody = table.children[0];
      Array.from(tbody.children).forEach(item => {
        var newTd = document.createElement("td");
        newTd.innerText = "-";
        newTd.style.cssText = `line-height:40px;border:1px solid lightgray`;
        var children = Array.from(item.children);
        for (var i = 0; i < children.length; i++) {
          if (parseInt(this.tableInfo.colIndex) === i) {
            var oldEle = children[i];
            if (direction === "before") {
              item.insertBefore(newTd, oldEle);
            } else {
              this.insertAfter(newTd, oldEle);
            }
            break;
          }
        }
      });
      this.$refs['menu'].style.display = "none";
      this.$parent.changeHTML();
    },
    deleteOne(index, event) {
      const table = this.$parent.$refs["richEdit"].children[0];
      const tbody = table.children[0];
      const tr = tbody.children[this.tableInfo.rowIndex];
      const td = tr.children[this.tableInfo.colIndex];
      switch (index) {
        case 0:
          tbody.removeChild(tr);
          break;
        case 1:
          console.log("删除当前列");
          this.operator("current", "deleteColumn");
          break;
        case 2:
          if (tr.previousElementSibling) {
            tbody.removeChild(tr.previousElementSibling);
          }
          break;
        case 3:
          if (tr.nextElementSibling) {
            tbody.removeChild(tr.nextElementSibling);
          }
          break;
        case 4:
          this.operator("before", "deleteColumn");
          break;
        case 5:
          this.operator("after", "deleteColumn");
          break;
        case 6:
          table.parentElement.removeChild(table);
          break;
      }
      this.$refs['menu'].style.display = "none";
      this.$parent.changeHTML();
    },
    operator(direction, type) {
      const table = this.$parent.$refs["richEdit"].children[0];
      const tbody = table.children[0];
      const tr = tbody.children[this.tableInfo.rowIndex];
      const td = tr.children[this.tableInfo.colIndex];
      Array.from(tbody.children).forEach(item => {
        var children = Array.from(item.children);
        for (var i = 0; i < children.length; i++) {
          if (type === "deleteColumn") {
            if (direction === "before") {
              if (i === (parseInt(this.tableInfo.colIndex) - 1)) {
                item.removeChild(children[i]);
                break;
              }
            } else if (direction === "after") {
              if (i === (parseInt(this.tableInfo.colIndex) + 1)) {
                item.removeChild(children[i]);
                break;
              }
            } else {
              if (i === parseInt(this.tableInfo.colIndex)) {
                item.removeChild(children[i]);
                break;
              }
            }
          }
        }
      });
      this.$refs['menu'].style.display = "none";
      this.$parent.changeHTML();
    },
    changeAlign(key, styleObj) {
      const table = this.$parent.$refs["richEdit"].children[0];
      const tbody = table.children[0];
      this.table = table;
      const tr = tbody.children[this.tableInfo.rowIndex];
      const td = tr.children[this.tableInfo.colIndex];
      switch (key) {
        case 0:
          console.log("修改单元格", styleObj);
          td.style.textAlign = styleObj.style["text-align"];
          break;
        case 1:
          console.log("列排列");
          Array.from(tbody.children).forEach((row, rowIndex) => {
            row.children[this.tableInfo.colIndex].style.textAlign =
              styleObj.style["text-align"];
          });
          break;
        case 2:
          Array.from(tbody.children[this.tableInfo.rowIndex].children).forEach(
            (col, colIndex) => {
              col.style.textAlign = styleObj.style["text-align"];
            }
          );
          break;
        default:
          break;
      }
      this.$parent.changeHTML();
    },

    setCurrentLineColor(color){
      const table = this.$parent.$refs["richEdit"].children[0];
      const tbody = table.children[0];
      const tr = tbody.children[this.tableInfo.rowIndex];
      tr.style.backgroundColor = color;
      this.$parent.changeHTML();
    },
    changeColor(color){
      console.log("颜色",color);
    },
    showPiker(type) {
      this.showColorPicker = !this.showColorPicker;
      if (type === "odd" && this.showColorPicker === true) {
        this.colorObj = this.oddColorObj;
      }
      if (type === "even" && this.showColorPicker === true) {
        this.colorObj = this.evenColorObject;
      }
    },
    mergeTd(){
      console.log("合并单元格",this.mergeList,this.rowspan,this.colspan);
      const table = this.$parent.$refs["richEdit"].children[0];
      const tbody = table.children[0];
      let rowIndex = this.mergeList[0].split("-")[0];
      let colIndex = this.mergeList[0].split("-")[1];
      /**
       * 获取mergeList里的第一个序号，作为合并的基础单元格，然后删除其他序号对应的单元格
       */
      let tr = tbody.children[rowIndex];
      let td = tr.children[colIndex];
      td.colSpan = this.colspan;
      td.rowSpan = this.rowspan;
      td.style.border = "1px solid lightgray";
      const tbodyChildren = Array.from(tbody.children);
      for(let i=1;i<this.mergeList.length;i++){
        rowIndex = this.mergeList[i].split("-")[0];
        colIndex = this.mergeList[i].split("-")[1];
        tr = tbodyChildren[rowIndex];
        td = tr.children[colIndex];
        const delObj = {
          'tr':tr,
          'td':td
        }
        td.style.display = 'none';
      }
      this.$parent.changeHTML();
    },
    /**
     * @description 设置css样式结束
     * 
    */
    hideCssDialog(){
      this.isOpenCssDialog = false;
      this.hideMenu();
    },
    hideMenu(){
      this.$refs['menu'].style.display = "none";
    }
  },
  mounted() {
    // this.table = this.$parent.$refs['richEdit'].$refs[''];
    console.log(this.$parent);
    document.onclick = ()=>{
      this.$refs['menu'].style.display = "none";
    }
  }
};
</script>

<style>
ul {
  list-style: none;
  padding: 0;
}
#menu {
  list-style: none;
  margin: 0;
  background: rgb(250, 250, 250);
  font-size: 12px;
  border: 1px solid lightgray;
  display: none;
  z-index: 11111;
}
#menu li {
  height: 30px;
  line-height: 30px;
  width: 100px;
  text-align: center;
}
#menu li:hover {
  background: lightcyan;
}
.deleteOperator,
.addOperator,
.trStyle,
.colorUL,.showAlignMenu,.alignMenu{
  margin-left: 100px;
  margin-top: -30px;
  border: 1px solid lightgray;
  width: 100px;
  background: white;
}
.colorUL {
  width: 200px;
}
#colorUL li {
  width: 200px;
}

</style>