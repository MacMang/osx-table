<template>
  <div class="osx-table">
    <div
      id="text_area"
      :contenteditable="isEdit"
      v-focus
      ref="richEdit"
      @blur="backupRange('输入框失去焦点')"
      @input="changeHTML"
    ></div>
    <!-- <table-menu ref="table-menu" :tableInfo="tableInfo" :mergeList="mergeList" :colspan="colSpan" :rowspan="rowSpan"></table-menu> -->
    <table-menu
      ref="table-menu"
      :slideDirection="slideDirection"
      :tableInfo="tableInfo"
      :mergeList="mergeList"
      :colspan="colSpan"
      :rowspan="rowSpan"
      :isOpenCssDialog.sync="isOpenCssDialog"
    ></table-menu>
    <div class="css-dialog" v-if="isOpenCssDialog" @click.stop="hideCssDialog">
      <div class="css-list" @click.stop>
        <div class="css-list-left">
          <ul class="css-type-list">
            <li @click="cssType = 'table' ">整个表格</li>
            <li @click="cssType = 'row' ">选中行</li>
            <li @click="cssType = 'colum' ">单元格</li>
          </ul>
          <ul>
            <li class="style-cell">
              边框
              <img
                :src="borderPNG"
                width="20"
                height="20"
                @click="setTableBorder('border')"
                style="margin-left:20px"
                alt
              />
              <img
                :src="borderNonePNG"
                width="20"
                height="20"
                @click="setTableBorder('none')"
                style="margin-left:20px"
                alt
              />
            </li>
            <li class="style-cell">
              <span>字体</span>
              <select v-model="styleObj['font-family']">
                <option v-for="(item,key) in fontFamily" :key="key" :value="item.en">{{item.cn}}</option>
              </select>
              <span>颜色</span>
              <div
                class="colorBox"
                @click="showFontColorPicker=true,title='字体颜色'"
                :style="{backgroundColor:fontBackgroundColor}"
              ></div>
              <span>大小</span>
              <input type="text" size="2" @change="changeFontSize" /> px
            </li>
            <li class="style-cell">
              <div>表格底纹</div>
              <div v-if="cssType==='table'" class="defaultCss">
                <span>奇行</span>
                <div
                  class="colorBox"
                  @click="showTableRowColorPicker=true,oddOrEvent='odd',title='表格底纹'"
                  :style="{backgroundColor:oddBGColor}"
                ></div>
                <span>偶行</span>
                <div
                  class="colorBox"
                  @click="showTableRowColorPicker=true,oddOrEvent='even',title='表格底纹'"
                  :style="{backgroundColor:evenBGColor}"
                ></div>
              </div>
              <div class="defaultCss" v-else-if="cssType==='row'">
                <span>当前行</span>
                <div
                  class="colorBox"
                  @click="showTableRowColorPicker=true,oddOrEvent='row',title='表格底纹'"
                  :style="{backgroundColor:currentRowBGColor}"
                ></div>
              </div>
              <div class="defaultCss" v-else>
                <span>当前列</span>
                <div
                  class="colorBox"
                  @click="showTableRowColorPicker=true,oddOrEvent='col',title='表格底纹'"
                  :style="{backgroundColor:currentColBGColor}"
                ></div>
              </div>
            </li>
          </ul>
          <ul class="css-list-bottom">
            <li @click="cancel">取消</li>
            <li @click="submit">确定</li>
          </ul>
        </div>
        <div class="css-list-right">
          <div>{{title}}</div>
          <color-picker @changeColor="changeColor"></color-picker>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tableMixin from "./table-mixin";
import tableMenu from "./menu";
import colorPicker from "./colorpicker";
import borderNonePNG from "./images/border-none.png";
import borderPNG from "./images/border.png";
import fontFamily from './font'
export default {
  name: "osx-table",
  mixins: [tableMixin],
  components: { tableMenu, colorPicker },
  props: {
    rows: {
      type: Number,
      default: 3
    },
    columns: {
      type: Number,
      default: 3
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    content: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      range: {}, //光标信息
      slideDirection: 0,
      tableInfo: {},
      mergeList: [],
      rowSpan: 1,
      colSpan: 1,
      isOpenCssDialog: false,
      cssType: "",
      showFontColorPicker: false,
      fontBackgroundColor: "black",
      oddOrEvent: "",
      showTableRowColorPicker: "", // 是否显示表格底纹的色卡选项
      oddBGColor: "", //奇数行背景颜色
      evenBGColor: "", //偶数行背景颜色
      currentRowBGColor: "", //当前行的背景颜色
      currentColBGColor: "",
      title: "字体颜色",
      borderNonePNG: borderNonePNG,
      borderPNG: borderPNG,
      fontFamily:fontFamily,
      styleObj: {
        "font-size": "12",
        color: "black",
        border: "0",
        "font-family": "宋体"
      }
    };
  },

  mounted() {
    this.backupRange();
    if (!this.content) {
      this.insertTable();
    }
    let richEdit = this.$refs["richEdit"];
    let tableMenu = this.$refs["table-menu"].$el;
    //选择元素
    var ctrlKey = false;
    richEdit.onkeydown = function(e) {
      var keyCode = e.keyCode || e.which || e.charCode;
      ctrlKey = e.ctrlKey || e.metaKey;
    };
    richEdit.onkeyup = function(e) {
      var keyCode = e.keyCode || e.which || e.charCode;
      ctrlKey = e.ctrlKey || e.metaKey;
      return false;
    };
    /**
     * 选中的单元格,如果单元格被选中两次，则将它从数组中移除
     * 判断用户选择的是否是连续的行或者列
     */
    let tdArr = [];
    richEdit.onclick = e => {
      tableMenu.style.display = "none";
      let table = richEdit.children[0];
      let tbody = table.children[0];
      if (!ctrlKey) {
        for (let i = 0; i < tdArr.length; i++) {
          const tdIndex = tdArr[i].split("-")[1];
          const trIndex = tdArr[i].split("-")[0];
          const td = tbody.children[trIndex].children[tdIndex];
          td.style.borderColor = "lightgray";
          td.style.borderWidth = "1px";
        }
        tdArr = [];
        return false;
      }
      if (tdArr.indexOf(this.tableInfoStr) === -1) {
        tdArr.push(this.tableInfoStr);
        // 选中之后，将选中的表格的边框颜色修改为蓝色
        for (let i = 0; i < tdArr.length; i++) {
          const tdIndex = parseInt(tdArr[i].split("-")[1]);
          const trIndex = parseInt(tdArr[i].split("-")[0]);
          const td = tbody.children[trIndex].children[tdIndex];
          td.style.borderColor = "blue";
          td.style.borderWidth = "2px";
          i;
          // 判断选中的是否是两个相邻的元素
          if (i < tdArr.length - 1) {
            console.log("还不是最后一个运算", tdArr[i + 1]);
            const nextTdIndex = parseInt(tdArr[i + 1].split("-")[1]);
            const nextTrIndex = parseInt(tdArr[i + 1].split("-")[0]);
            //如果列相等，行数减一就不能大于1
            if (
              nextTdIndex === tdIndex &&
              trIndex === Math.abs(nextTrIndex - 1)
            ) {
              console.log("选择的列是相等的,且元素相邻");
              this.rowSpan = tdArr.length;
              this.colSpan = 1;
            } else if (
              nextTrIndex === trIndex &&
              tdIndex === Math.abs(nextTdIndex - 1)
            ) {
              console.log("选择的行是相等的,且元素相邻");
              this.colSpan = tdArr.length;
              this.rowSpan = 1;
            } else {
              console.log("请选择相邻的元素");
              tdArr.pop();
              console.log(tdArr);
            }
            this.mergeList = tdArr;
          }
        }
      } else {
        //移除
        const index = tdArr.indexOf(this.tableInfoStr);
        const tdIndex = tdArr[index].split("-")[1];
        const trIndex = tdArr[index].split("-")[0];
        const td = tbody.children[trIndex].children[tdIndex];
        td.style.borderColor = "rgb(147, 146, 146)";
        td.style.borderWidth = "1px";
        tdArr.splice(index, 1);
        console.log("从tdArr中移除", tdArr);
      }
      return false;
    };

    //设置右键功能
    richEdit.oncontextmenu = ev => {
      let oEvent = ev || event;
      //判断右键时鼠标在哪个位置，如果超出一个范围就让它显示在左边
      let w = document.documentElement.clientWidth || document.body.clientWidth;
      let h =
        document.documentElement.clientHeight || document.body.clientHeight;
      let mouseClientY = oEvent.clientY;
      let mouseClientX = oEvent.clientX;
      tableMenu.style.position = "fixed";
      tableMenu.style.display = "block";
      if (w - mouseClientX < 300) {
        tableMenu.style.top = oEvent.clientY + "px";
        tableMenu.style.left = mouseClientX - 200 + "px";
      } else {
        tableMenu.style.top = oEvent.clientY + "px";
        tableMenu.style.left = mouseClientX - 80 + "px";
        tableMenu.style.right = "";
      }
      this.slideDirection = w - mouseClientX;
      return false;
    };
  },
  watch: {
    content(val) {
      const richEdit = this.$refs["richEdit"];
      richEdit.innerHTML = val;
    }
  },
  methods: {
    changeColor(color) {
      console.log("颜色值", color);
      if (this.title === "字体颜色") {
        this.changeFontColor(color);
      } else if (this.title === "表格底纹") {
        this.changeTabelRowBackgroundColor(color);
      }
    },
    changeHTML() {
      const richEdit = this.$refs["richEdit"];
      this.$emit("change", richEdit.innerHTML);
    },
    backupRange(text) {
      let selection = window.getSelection();
      let range = selection.getRangeAt(0);
      this.range = selection.getRangeAt(0);
      this.currentSelection = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      };
      localStorage.setItem(
        "currentSelection",
        JSON.stringify(this.currentSelection)
      );
    },
    // 插入表格
    insertTable() {
      var innerDom = this.range.extractContents();
      var table = document.createElement("table");
      table.className = "insertTable";
      table.setAttribute("cellspacing", 0);
      table.setAttribute("cellpadding", 0);
      table.setAttribute("border", 0);
      const tbody = document.createElement("tbody");
      var rs = "";
      for (let i = 0; i < this.rows; i++) {
        var tr = document.createElement("tr");
        for (let j = 0; j < this.columns; j++) {
          var td = document.createElement("td");
          td.style.cssText = `flex:1;line-height:40px;border:1px solid lightgray`;
          td.innerHTML = "&nbsp;-";
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      table.appendChild(innerDom);

      this.range.insertNode(table);
      // this.adjustList('.insertTable');
      table.parentElement.onmousedown = e => {
        const td = e.target;
        const tr = e.target.parentElement;
        const tbody = tr.parentElement;
        const colIndex = Array.from(tr.children).indexOf(td);
        const rowIndex = Array.from(tbody.children).indexOf(tr);
        const str = rowIndex + "-" + colIndex;
        console.log("tableInfoStr", str);
        this.selectRowAndColumns(str);
      };
    },
    //选中的单元格
    selectRowAndColumns(tableInfoStr) {
      const tableInfo = tableInfoStr.split("-");
      this.tableInfoStr = tableInfoStr;
      this.tableInfo = {
        colIndex: tableInfo[1],
        rowIndex: tableInfo[0]
      };
    },
    hideCssDialog() {
      this.isOpenCssDialog = false;
    },
    setTableBorder(type) {
      this.styleObj.border = type === "none" ? "none" : "1px solid lightgray";
      
    },
    submit() {
      const table = this.$refs["richEdit"].children[0];
      const tbody = table.children[0];
      let styleStr = "";
      for (let key in this.styleObj) {
        if (this.styleObj.hasOwnProperty(key)) {
          styleStr += key + ":" + this.styleObj[key] + ";";
        }
      }
      if (this.cssType === "table") {
        table.style.cssText = table.style.cssText + ";" + styleStr;
        for (let i = 0; i < table.children.length; i++) {
          const tr = tbody.children[i];
          // 0开始为奇数行
          if (i % 2 === 0) {
            tr.style.background = this.oddBGColor;
          } else {
            tr.style.background = this.evenBGColor;
          }
        }
        console.log("样式",this.styleObj);
        //如果表格的border设置为none，则表格内的所有元素的边框都为none
        if (this.styleObj.border === "none") {
          console.log("表格的边框为",this.styleObj.border);
          for (let i = 0; i < tbody.children.length; i++) {
            const tr = tbody.children[i];
            tr.style.border = "none";
            for(let j=0;j<tr.children.length;j++){
              const td = tr.children[j];
              td.style.border = "none";
            }
          }
        }
      } else if (this.cssType === "row") {
        //设置选中行的样式
        const row = tbody.children[this.tableInfo["rowIndex"]];
        row.style.cssText = row.style.cssText + ";" + styleStr;
        row.style.background = this.currentRowBGColor;
        if (this.styleObj.border === "none") {
          for(let j=0;j<row.children.length;j++){
            const td = row.children[j];
            td.style.border = "none";
          }
        }else{
           for(let j=0;j<row.children.length;j++){
            const td = row.children[j];
            td.style.border = "1px solid lightgray";
          }
        }
      } else {
        const col =
          tbody.children[this.tableInfo["rowIndex"]].children[
            this.tableInfo["colIndex"]
          ];
        col.style.cssText = col.style.cssText + ";" + styleStr;
        col.style.background = this.currentColBGColor;
      }

      this.hideCssDialog();
      this.changeHTML();
    },
    cancel() {
      this.hideCssDialog();
    },
    //获取字体颜色
    changeFontColor(color) {
      this.fontBackgroundColor = color;
      this.showFontColorPicker = false;
      // this.styleObj.fontColor = color;
      this.$set(this.styleObj, "color", color);
    },
    // 设置 奇偶行的颜色
    changeTabelRowBackgroundColor(color) {
      console.log(this.oddOrEvent);
      if (this.oddOrEvent === "odd") {
        console.log("设置奇数行");
        this.oddBGColor = color;
      } else if (this.oddOrEvent === "even") {
        console.log("设置偶数行");
        this.evenBGColor = color;
      } else if (this.oddOrEvent === "row") {
        this.currentRowBGColor = color;
      } else {
        this.currentColBGColor = color;
      }
      this.showTableRowColorPicker = false;
    },
    //修改字体大小
    changeFontSize(ev) {
      const value = ev.target.value;
      console.log("字体大小", ev);
      this.styleObj["font-size"] = value + "px";
    }
  }
};
</script>

<style>
#text_area,
#coldView {
  width: 100%;
  height: 100%;
  outline: none;
  border: none;
  resize: none;
  padding: 5px;
  text-align: left;
  box-sizing: border-box;
}
.text_area > p {
  padding: 0;
}
.insertTable {
  border-collapse: collapse;
  width: 100%;
  height: 100%;
  table-layout: fixed;
  word-break: break-all;
}
.css-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 11111;
}

/* 侧边栏头部 */
.css-type-list {
  width: 100%;
  background: white;
  display: flex;
  flex-direction: row;
}
.css-type-list li {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 样式列表 */
.css-list {
  width: 50%;
  height: 50%;
  position: absolute;
  background: white;
  display: flex;
  flex-direction: row;
}
.style-cell {
  display: flex;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  font-size: 12px;
}
.style-cell > * {
  margin-right: 5px;
}
.css-list-left {
  width: 60%;
  height: 100%;
}
.css-list-right {
  width: 40%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
/* 底部 */
.css-list-bottom {
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  position: absolute;
  bottom: 0;
}
.css-list-bottom li {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 字体颜色 */
.colorBox {
  width: 12px;
  height: 12px;
  border: 1px solid lightslategray;
}
.fontColorPicker,
.table-row-color-picker {
  display: flex;
  justify-content: center;
}
.defaultCss {
  display: flex;
}
.defaultCss > * {
  margin-right: 5px;
}
</style>