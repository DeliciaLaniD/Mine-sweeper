function Mine(tr, td, minNum) {
  this.tr = tr; // 行数
  this.td = td; // 列数
  this.minNum = minNum; // 雷的数量

  // 如果是雷，则game over，如果是数字显示数字
  this.squares = []; // 二维数组，存储所有方块的信息，按行与列的顺序排放，存取都使用行列的形式，
  this.tds = [] // 存储所有单元格的dom,后期需要操作其样式
  this.surplusMine = minNum; // 剩余雷的数量，用户右击，标记小红旗，剩余雷数量
  this.allRight = false; // 右击标的小红旗是否全是雷，用于判断用户是否游戏成功

  this.parent = document.querySelector('.gameBox');
}

// 生成N个不重复的数字
Mine.prototype.randomNum = function () {
  var square = new Array(this.tr * this.td);
  for (var i = 0; i < square.length; i++) {
    square[i] = i;
  }
  square.sort(function() {
    return 0.5 - Math.random();
  })
  return square.slice(0, this.minNum);
}

Mine.prototype.init = function () {
  // this.randomNum()

  var rn = this.randomNum(); // 随机生成的minNumber个数字，表示雷的位置
  var n = 0; // 用于找到格子对应的索引
  for (var i = 0; i < this.tr; i++) {
    this.squares[i] = [];
    for (var j = 0; j < this.td; j++) {
      // this.squares[i][j] = 
      // n++;
      // 取一个方块在数组里的数据要使用行与列的形式去取，找方块周围的方块的时候要用坐标的形式去取，行与列的形式跟坐标的形式x,y相反
      if (rn.indexOf(++n) !== -1) {
        // 表示现在循环到的索引n在雷的数组里找到了，表示该索引是雷
        this.squares[i][j] = { type: 'mine', x: j, y: i};
      } else {
        this.squares[i][j] = { type: 'number', x: j, y: i, value: 0};
      }
    }
  }

  this.updateNum();

  this.createDom();
  // 右键，阻止出现右键的对话框
  this.parent.oncontextmenu = function () {
    return false;
  }

  // 剩余雷的数量
  this.minNum = document.querySelector('.minNumber');
  this.minNum.innerHTML = this.surplusMine;
}

// 创建表格
Mine.prototype.createDom = function (){
  var that = this;
  var table = document.createElement('table');

  for (var i = 0; i < this.tr; i++) {
    var domTr = document.createElement('tr');
    this.tds[i] = []

    for (var j = 0; j < this.td; j++) {
      var domTd = document.createElement('td');

      // domTd.innerHTML = 0;
      domTd.pos = [i, j]; //把格子对应的行与列存到格子身上，为了下面通过这个值去数组里取到对应的数据
      domTd.onmousedown = function() {
        that.play(event, this); // that指实例对象,this指点击的那个td，domTd
      }

      this.tds[i][j] = domTd; // 把所有创建的td添加到数组当中

      // // 添加雷
      // if (this.squares[i][j].type == 'mine') {
      //   domTd.className = 'mine';
      // }

      // // 添加数字
      // if (this.squares[i][j].type == 'number') {
      //   domTd.innerHTML = this.squares[i][j].value;
      // }
      domTr.appendChild(domTd);
    }
    table.appendChild(domTr);
  }
  this.parent.innerHTML = ''; // 避免多次点击button ，叠加
  this.parent.appendChild(table);
}

// 用于找某个方格周围的8个方格
Mine.prototype.getAround = function(square) {
  var x = square.x;
  var y = square.y;
  var result = []; // 把找到的格子的坐标返回出去，表示二维数组

  // x-1,y-1  x,y-1  x+1,y-1
  // x-1,y    x,y    x+1,y
  // x-1,y+1  x,y+1  x+1,y+1
  // x,y表示雷本身
  // 通过坐标循环到九宫格， i, j表示坐标
  for(var i = x-1; i <= x+1; i++) {
    for (var j = y-1; j <= y+1; j++) {
      // 格子超出了左边、上边、右边、下边的范围；当前循环的格子是自己；周围的格子是个雷；
      if (i < 0 || j < 0 || i > this.td - 1 || j > this.tr - 1 || i == x && j == y || this.squares[j][i].type == 'mine'){
        continue;
      }
      result.push([j,i]) //可以以行与列的形式返回去，到时候需要用它去取数组里面的数据
    }
  }
  return result;
}

// 更新数字
Mine.prototype.updateNum = function() {
  for (var i = 0; i < this.tr; i++) {
    for (var j = 0; j < this.td; j++) {
      // 只更新雷周围的数字
      if (this.squares[i][j].type === 'number') {
        continue;
      }
      var num = this.getAround(this.squares[i][j]); // 获取到每个雷周围的数字
      for (var k = 0; k < num.length; k++) {
        this.squares[num[k][0]][num[k][1]].value += 1;
      }
    }
  }
}

Mine.prototype.play = function (ev, obj) {
  var that = this;
  console.log(obj)
  if (ev.which === 1 && obj.className != 'flag') { // 限制用户标完红旗之后就不能左键点击了
    // 点击的左键
   var curSquare = this.squares[obj.pos[0]][obj.pos[1]]
   var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
   console.log(curSquare)
   if (curSquare.type == 'number') {
     obj.innerHTML = curSquare.value;
     obj.className = cl[curSquare.value];
     if (curSquare.value == 0) {
      //  点到数字0，先找八个格子，如果有0，则继续找八个格子
      // 1.显示自己；2.找四周：（1）显示四周，如果值不为0，则就显示到这里，不需要再找了；
      // （2）如果值为0，则显示自己，找四周
      obj.innerHTML = ''; // 数字为0，则不显示，即显示自己；
      function getAllZero(square) {
        var around = that.getAround(square);
        for (var i = 0; i < around.length; i++) {
          // around[i] = [0, 0];
          var x = around[i][0];//行
          var y = around[i][1];// 列

          that.tds[x][y].className = cl[that.squares[x][y].value];

          if (that.squares[x][y].value === 0) {
            // 以一个格子为中心，如果八个格子中有一个是0，就需要递归
            if (!that.tds[x][y].check) {
              // 给对应的td添加一个属性，该属性决定某个格子是否被检查过了，如果找过了，则赋值true，下一次不会找了
              that.tds[x][y].check = true;
              getAllZero(that.squares[x][y]);
            }
          } else {
            that.tds[x][y].innerHTML = that.squares[x][y].value;
          }
        }
      }
      getAllZero(curSquare)
     }
   } else {
     this.gameOver(obj);
   }
  } else if (ev.which === 3) {
    // 用户点击的是右键，标上红旗，红旗可以取消；标错了的话，游戏结束
    // 右击的是数字，则不能点击
    if (obj.className && obj.className != 'flag') {
      return;
    } else {
      obj.className = obj.className == 'flag' ? '' : 'flag'; // 切换class

      if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
        this.allRight = true; // 用户标的小红旗都是雷
      } else {
        this.allRight = false;
      }

      if (obj.className == 'flag') {
        this.minNum.innerHTML = --this.surplusMine;
      } else {
        this.minNum.innerHTML = ++this.surplusMine;
      }
      
      if (this.surplusMine == 0) {
        // 剩余的雷数量为0，表示用户已经标完小红旗了，这时候要判断游戏是成功还是结束
        if (this.allRight) {
          // 用户全部标对小红旗
          alert("恭喜你，游戏通过");
        } else {
          alert('游戏失败');
          this.gameOver();
        }
      }
    }
  }
}

// 游戏失败
Mine.prototype.gameOver = function (clickTd) {
  // 显示所有雷；取消所有格子的点击事件；给点中的雷标上红色；
  for (var i = 0; i < this.tr; i++) {
    for (var j = 0; j < this.td; j++) {
      if (this.squares[i][j].type == 'mine') {
        this.tds[i][j].className = 'mine';
      }
      this.tds[i][j].onmousedown = null;
    }
  }
  if (clickTd) {
    clickTd.style.backgroundColor = '#f00';
  }
}

// button的功能
var btns = document.querySelectorAll('.level button');
var mine = null; // 用于存储生成的实例
var ln = 0; // 处理当前选中的状态
var arr = [[9, 9 ,10], [16, 16, 40], [28, 28, 99]] // 不同级别

for (let i = 0; i < btns.length - 1; i++) {
  btns[i].onclick = function() {
    btns[ln].className = '';
    console.log(this) //dom
    this.className = 'active';

    mine = new Mine(...arr[i]);
    mine.init();

    ln = i;
  }
}

btns[0].onclick(); // 初始化展示初级
btns[3].onclick = function () {
  mine.init();
}
// var mine = new Mine(28, 28, 99);
// mine.init()