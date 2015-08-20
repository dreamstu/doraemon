var fs = require('fs');
var path = require('path');
var gui = require('nw.gui');
var shell = gui.Shell;
var win = gui.Window.get();
var _ = require('underscore');

global.debug = false;
global.mainWindow = gui.Window.get();
global.jQuery = $;
global._ = _;
global.localStorage = window.localStorage;
global.showWindow = true;

//托盘图标
var tray = new gui.Tray({ title: 'doraemon', icon: '../images/icon.png' });
tray.tooltip = 'doraemon';
var menu = new gui.Menu();
menu.append(new gui.MenuItem(
	{ label: '最小化' , click:function(){
		win.minimize();
	}}
));
menu.append(new gui.MenuItem(
	{ label: '退出' , click:function(){
		if(confirm('你要关闭构建工具吗？')){
			win.close();
		}
	}}
));
tray.menu = menu;

var contentBox = document.querySelector('#logcontent');
var builder = require('quick-build-core')({
	printLog:function(){
        if(global.debug){
			console.log(Array.prototype.join.call(arguments,''));
		}else{
			var p = document.createElement('p');
			p.innerHTML = Array.prototype.join.call(arguments,'');
			contentBox.appendChild(p);
			contentBox.scrollTop = contentBox.scrollHeight;
		}
    },
    process:function(name){
        this.printLog('# 当前已完成：',name);
    },
    done:function(shell){
        this.printLog('# 任务全部完成！');
        this.printLog('-------------任务结束-----------');
        layer.closeAll('page');
        layer.open({
			icon: 1,
			title:false,
			content:'构建完成，请选择操作',
			btn: ['打开输出目录','关闭'],
			cancel:function(){
			},
			yes:function(){
				gui.Shell.showItemInFolder(vm.outFolder);
			}
		});
        //shell.exit(0);
    }
});

//drag folder to window
global.mainWindow.window.ondrop = function (e) {
    e.preventDefault();
    return false;
};
global.mainWindow.window.ondragover = function (e) {
    e.preventDefault();
    return false;
};

/**
 *处理错误
 * err 错误堆栈
 * fatal 是否致命，致命终止程序的执行
**/
function catchError(err,fatal){
	if(err){
		console.log(new Date().getTime()+'\t',err);
		if(fatal){return;}	
	}
}

var logPanel = $('#log');

//捕获页
var vm = new Vue({
	el:'#app',
	replace:false,
	data:{
		//预构建文件夹队列	
		folderPath:'',
		folderName:'',
		//组件列表
		items:[],
		//
		inFolder:'',
		//构建输出父目录
		outFolder:'',
		//全选
		checkAll:false,
		//缓存组件列表
		cached:{},
		//显示info面板
		showInfo:false,
		//压缩
		uglify:true,
		//详细日志
		moreLog:false,
		idleading:'',
		//组件简介package.json
		pkg:{},
		//显示拖拽文件夹提示
		showDragMask:true,
		showFolder:false,
		aboutWin:null
	},
	watch:{
		items:function(items){
			if(items && items.length>0){
				this.showDragMask = false;
			}else{
				this.showDragMask = true;
			}
		},
		inFolder:function(inf,old){
			if(inf!=old){
				this.showFolder = true;
				//添加到预期构建文件夹队列		
				this.addToPreBuild();
			}else{
				this.showFolder = false;
			}
			console.log('inFolder change:',inf);
		},
		checkAll:function(check){
			console.log('checkAll change:',check);
			$('input[name="chk"]').attr('checked',check).prop('checked',check);
		}
	},
	methods:{
		getPkgInfo:function(module){
			var pkg = JSON.parse(fs.readFileSync(path.join(module,'package.json')));
			this.pkg.$set('名称',pkg.name);
			this.pkg.$set('版本',pkg.version);
			this.pkg.$set('说明',pkg.description);
			this.pkg.$set('创建人',pkg.author);
			this.pkg.$set('协议',pkg.licenses)
		},
		showLogPanel:function(){
			layer.open({
			    type: 1,
			    title: '构建日志', //不显示标题
			    move:false,
			    content: logPanel, //捕获的元素
			    area:['800px', '500px'],
			    end:function(){
			    	logPanel.hide();
			    }
			});
		},
		showInfoEvent:function(){
			this.showInfo = true;
		},
		closeInfoEvent:function(){
			this.showInfo = false;
		},
		viewInfo:function(e){
			if(e.target.nodeName=='SPAN'){
				this.showInfoEvent();
				this.getPkgInfo(path.join(this.inFolder,e.target.innerText));	
			}else{
				this.closeInfoEvent();
			}
		},
		openFolder:function(){
			this.$$.inFolder.click();
		},
		open:function(){
			this.inFolder = this.$$.inFolder.value;
		},
		out:function(){
			this.$$.outFolder.click();
		},
		addToPreBuild:function(){
			var currPath = this.inFolder;
			var name = path.basename(currPath);
			this.idleading = name;
			if(this.folderPath == currPath){
				layer.msg('已经是当前文件夹！');
				return;
			}
			this.folderPath = currPath;
			this.folderName = name;
			//尝试读取缓冲
			if(!this.cached[currPath]){
				this.getQueueFileList(currPath);	
			}else{
				this.items = this.cached[currPath];
			}
		},
		getQueueFileList:function(inf){
			if(!inf) return;
			var self = this;
			builder.getQueue(inf,function(err,queue){
				if(err){
					layer.msg('获取组件列表失败！');
				}else{
					//设置缓存
					self.items = self.cached[inf] = queue;
				}
			});
		},
		refresh:function(){
			this.getQueueFileList(this.inFolder);
		},
		tmp:function(){
			
		},
		build:function(){
			
			this.closeInfoEvent();

			if(this.inFolder==''){
				layer.tips('没有添加构建文件夹','#list',{
					tips:2
				});
				return;
			}

			var queue = [];
			if(this.checkAll){
				queue = [].concat(this.cached[this.inFolder]);
			}else{
				var arr = $('#items input[name="chk"]:checked');
				for (var i = 0; i < arr.length; i++) {
					queue.push(arr[i].value);
				}
			}

			if(queue.length==0){
				layer.msg('没有选择要构建的组件');
				return;
			}
			if(this.idleading==''){
				layer.tips('没有输入idleading','.idleading',{
					tips:1
				});
				return;
			}
			if(this.outFolder==''){
				layer.tips('没有选择输出目录','.outbtn',{
					tips:1
				});
				return;
			}



			var root = path.dirname(this.inFolder);
			var params = {
				root:root,
				tmp:path.join(root,'tmp'),
				queue:queue,
				outf:this.outFolder,
				inf:this.inFolder,
				moreLog:this.moreLog,
				uglify:this.uglify,
				id:this.idleading
			};
			try{
				builder.start(params);
				this.showLogPanel();
			}catch(e){
				layer.msg(e);
			}
		},
		about:function(){
			this.aboutWin = gui.Window.open('./about.html',{
			  position: 'center',
			  width: 550,
			  height: 220,
			  resizable:false,
			  minimize:false,
			  focus:true,
			  toolbar:false
			});
			this.aboutWin.on('close',function(){
				this.hide();
			});
		}
	}
});

win.on('close',function(){
	if(vm.aboutWin){
		vm.aboutWin.close(true);
	}
	this.hide();
	this.close(true);
});

(function bindDragEvents () {
    $('html')[0].ondrop = function (e) {
        var items = e.dataTransfer.files;
        for (var i = 0; i < items.length; ++i) {
            var itemPath = items[i].path;
            vm.inFolder = itemPath;
        }
    }
})();
