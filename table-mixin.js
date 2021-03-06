import Vue from 'vue';
export default {
    data() {
        return {
            show: false,
            isTable: false
        }
    },
    methods: {
        execCommand: (command, value) => {
            value ? document.execCommand(command, false, value) : document.execCommand(command, false, null)
        },
        handleClose(event) {
            this.show = false;
        },
        restoreRange(currentSelection) {
            let selection = window.getSelection();
            selection.removeAllRanges();
            let range = document.createRange();
            range.setStart(currentSelection.startContainer, currentSelection.startOffset);
            range.setEnd(currentSelection.endContainer, currentSelection.endOffset);
            // 向选区中添加一个区域
            selection.addRange(range);
        },

        adjustList(typeName) {
            let lists = document.querySelectorAll(typeName);
            console.log(lists);
            for (let i = 0; i < lists.length; i++) {
                let ele = lists[i]; // ol
                let parentNode = ele.parentNode;
                if (parentNode.tagName === 'P' && parentNode.firstChild.tagName === "TABLE") {
                    console.log("table会进来的");
                    parentNode.insertAdjacentElement('beforebegin', ele);
                    // parentNode.remove()
                    this.removeNode(parentNode);
                }
            }
        },
        //根据浏览器的不同添加不同的移除方法
        removeNode(obj) {
            if (this.isIE() || this.isIE11()) {
                obj.removeNode(true);
            } else {
                obj.remove();
            }
        },
        isIE() {
            if (!!window.ActiveXObject || "ActiveXObject" in window) {
                return true;
            } else {
                return false;
            }
        },
        isIE11() {
            if ((/Trident\/7\./).test(navigator.userAgent)) {
                return true;
            } else {
                return false;
            }
        },
        // 取消
        richEditBlur() {
            this.$parent.$refs.richEdit.blur();
        },
         //取得该文件的url
        getObjectURL(file) {
            var url = null;
            if (window.createObjectURL != undefined) {
                url = window.createObjectURL(file);
            } else if (window.URL != undefined) {
                url = window.URL.createObjectURL(file);
            } else if (window.webkitURL != undefined) {
                url = window.webkitURL.createObjectURL(file);
            }
            return url;
        }
    },
    watch: {
        show(value) {
            if (value) {
                document.addEventListener("click", this.test)
                // console.log("hello");
                // console.log(this);
                // this.backupRange('测试值');
            } else {
                document.removeEventListener('click', this.test)
            }
        },

    },

    created() {
        // this.backupRange();
    },
    directives: {
        focus: {
          inserted: function(el) {
            el.focus();
            el.style.cssText = `
                  border:none;
                  outline:none;
                `;
          }
        }
      }
}
