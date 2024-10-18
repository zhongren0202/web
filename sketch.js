let shapes = [];
let cols = 3; // 列数
let rows = 4; // 行数
let cellWidth;
let cellHeight;

function setup() {
  createCanvas(800, 600);
  cellWidth = width / cols;   // 每个单元格的宽度
  cellHeight = height / rows; // 每个单元格的高度
  background(255);
}

function draw() {
  background(255, 255, 255, 20); // 半透明白色背景，保留动画残影

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    s.update();
    s.display();
    if (s.isFinished()) {
      shapes.splice(i, 1);
    }
  }
}

function mousePressed() {
  let col = int(mouseX / cellWidth);
  let row = int(mouseY / cellHeight);
  let region = row * cols + col; // 区域编号 (0-11)

  switch (region) {
    case 0:
      shapes.push(new ExpandingCircle(random(width), random(height), color(random(255), random(255), random(255))));
      break;
    case 1:
      shapes.push(new SpiralCircles(width / 2, height / 2, color(random(255), random(255), random(255))));
      break;
    case 2:
      shapes.push(new ExpandingAndFadingCircles()); // 第三个区域
      break;
    case 3:
      shapes.push(new MovingLines()); // 第四个区域的效果
      break;
    case 5: // 第六个区域
      shapes.push(new Explosion()); // 不需要传递坐标
      break;
    case 6:
      shapes.push(new DynamicLine()); // 第七个区域的折线效果
      break;
    case 7:
      shapes.push(new Polygon(width / 2, height / 2, color(random(255), random(255), random(255)))); // 第八个区域
      break;
    // 其他区域的效果...
  }
}

// 定义所有形状类
class Shape {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.opacity = 255;
  }

  update() {
    // abstract method
  }

  display() {
    // abstract method
  }

  isFinished() {
    return this.opacity <= 0;
  }
}

// 扩散消失效果类：生成多个随机位置、大小的圆，逐渐扩散到环形并消失
class ExpandingAndFadingCircles extends Shape {
  constructor() {
    super(0, 0, color(0)); // 此处 x, y 和 col 不使用，忽略即可
    this.circles = [];
    this.numCircles = int(random(5, 10)); // 随机生成 5 到 10 个圆

    // 初始化圆列表
    for (let i = 0; i < this.numCircles; i++) {
      let cx = random(width);       // 随机 x 位置
      let cy = random(height);      // 随机 y 位置
      let startSize = random(10, 30); // 随机初始大小
      let maxSize = random(60, 150);  // 随机最大扩散大小
      let c = color(random(255), random(255), random(255)); // 随机颜色
      let delay = random(0, 300); // 随机延迟时间
      this.circles.push(new Circle(cx, cy, startSize, maxSize, c, delay));
    }
  }

  update() {
    for (let i = this.circles.length - 1; i >= 0; i--) {
      let circle = this.circles[i];
      circle.update();
      if (circle.isFinished()) {
        this.circles.splice(i, 1); // 移除已消失的圆
      }
    }

    // 所有圆消失后结束动画
    if (this.circles.length === 0) {
      this.opacity = 0;
    }
  }

  display() {
    for (let circle of this.circles) {
      circle.display();
    }
  }

  isFinished() {
    return this.opacity <= 0;
  }
}

// 单个圆类：从随机大小开始扩散到最大大小后变为环形淡出消失
class Circle {
  constructor(x, y, startSize, maxSize, col, delay) {
    this.x = x;
    this.y = y;
    this.outerSize = startSize; // 设置外半径为初始大小
    this.innerSize = 0; // 内半径初始为 0
    this.maxSize = maxSize; // 设置最大外半径
    this.col = col;
    this.opacity = 255;
    this.delay = delay; // 随机延迟时间
    this.startTime = millis() + this.delay; // 计算开始时间
  }

  update() {
    // 检查是否到达开始时间
    if (millis() >= this.startTime) {
      if (this.outerSize < this.maxSize) {
        this.outerSize += 10; // 扩散速度
      } else {
        this.innerSize += 10; // 内半径慢慢增加，形成环
        this.opacity -= 5;   // 淡出速度
      }
    }
  }

  display() {
    // 绘制环形
    fill(this.col, this.opacity);
    noStroke();
    // 使用两个椭圆来绘制环形
    if (this.innerSize < this.outerSize) {
      ellipse(this.x, this.y, this.outerSize, this.outerSize); // 外圆
      fill(255, this.opacity); // 内圆的颜色和透明度
      ellipse(this.x, this.y, this.innerSize, this.innerSize); // 内圆
    }
  }

  isFinished() {
    return this.opacity <= 0; // 判断是否完全消失
  }
}

// 圆圈扩散效果
class ExpandingCircle extends Shape {
  constructor(x, y, col) {
    super(x, y, col);
    this.radius = random(10, 40);       // 随机初始大小
    this.maxRadius = random(120, 270);   // 随机最大大小
  }

  update() {
    if (this.radius < this.maxRadius) {
      this.radius += 10; // 扩散速度
    } else {
      this.opacity -= 10; // 达到最大半径后开始消失
    }
  }

  display() {
    fill(this.col, this.opacity);
    noStroke();
    ellipse(this.x, this.y, this.radius, this.radius);
  }

  isFinished() {
    return this.opacity <= 0;
  }
}

// 螺旋小球效果
class SpiralCircles extends Shape {
  constructor(x, y, col) {
    super(x, y, col);
    this.radius = 200;
    this.numCircles = 18;                  // 小球数量
    this.angleStep = TWO_PI / this.numCircles;  // 将小球均匀分布在圆形上
    this.currentCircle = 0;
    this.positions = [];
    this.startAngle = random(TWO_PI);      // 从随机角度开始生成
  }

  update() {
    // 增加小球形成的延迟
    if (frameCount % 3 === 0 && this.currentCircle < this.numCircles) {
      let angle = this.startAngle + this.currentCircle * this.angleStep;
      let newX = this.x + cos(angle) * this.radius;
      let newY = this.y + sin(angle) * this.radius;
      this.positions.push(createVector(newX, newY));
      this.currentCircle++;
    } else if (this.currentCircle >= this.numCircles && this.positions.length > 0) {
      // 小球开始逐渐消失
      this.positions.pop();
    } else if (this.positions.length === 0) {
      this.opacity -= 1;
    }
  }

  display() {
    fill(this.col, this.opacity);
    noStroke();
    for (let pos of this.positions) {
      ellipse(pos.x, pos.y, 30, 30); // 增大小球的大小
    }
  }

  isFinished() {
    return this.opacity <= 0 && this.positions.length === 0;
  }
}

// 第四个区域的效果类：生成六条随机延伸的粗线
class MovingLines extends Shape {
  constructor() {
    super(0, 0, color(0)); // 不使用 color, 忽略
    this.lines = [];
    this.finished = false;

    let numLines = 6;
    let spacing = 60; // 每条线之间的垂直间隔
    let baseY = height / 2 - (numLines / 2) * spacing; // 计算起始 Y 位置，垂直居中

    for (let i = 0; i < numLines; i++) {
      this.lines.push(new LineSegment(baseY + i * spacing));
    }
  }

  update() {
    let allFinished = true;
    for (let line of this.lines) {
      line.update();
      if (!line.isFinished()) {
        allFinished = false;
      }
    }
    this.finished = allFinished;
  }

  display() {
    for (let line of this.lines) {
      line.display();
    }
  }

  isFinished() {
    return this.finished;
  }
}

// 单条线段类，用于 MovingLines 类
class LineSegment {
  constructor(startY) {
    this.startY = startY;
    this.col = color(0);          // 黑色
    this.speed = 22;              // 加快速度
    this.startX = 100;            // 起始位置在画布更靠近一侧的位置
    this.targetX = width - 100;   // 停止位置在另一侧

    this.currentX = this.startX; // 初始化当前位置
    this.finished = false;
    this.opacity = 0;       // 初始透明度
    this.waveOffset = random(TWO_PI); // 为波动效果初始化一个偏移量
  }

  update() {
    if (abs(this.currentX - this.targetX) > 10) {
      this.currentX += this.speed;
      this.opacity = map(this.currentX, this.startX, this.targetX, 0, 255); // 随着移动增加透明度
    } else {
      if (abs(this.startX - this.currentX) > 10) {
        this.startX += this.speed;
        this.opacity = map(this.startX, this.startX, this.targetX, 255, 0); // 在返回时降低透明度
      } else {
        this.finished = true;
      }
    }
    this.waveOffset += 0.1; // 每帧增加偏移量，让线条产生波动效果
  }

  display() {
    stroke(this.col, this.opacity);
    strokeWeight(20); // 较粗的线条

    // 波动效果，使线条左右晃动
    let waveEffect = sin(this.waveOffset) * 5; // 5 是波动幅度
    line(this.startX, this.startY + waveEffect, this.currentX, this.startY + waveEffect);
  }

  isFinished() {
    return this.finished;
  }
}

// 爆炸效果类
class Explosion extends Shape {
  constructor() {
    super(0, 0, color(0)); // 这里忽略颜色
    this.particles = [];
    this.numParticles = int(random(20, 50)); // 随机生成粒子数量

    // 初始化粒子列表
    for (let i = 0; i < this.numParticles; i++) {
      // 随机生成位置在画布内
      let x = random(width);
      let y = random(height);
      let speed = random(1, 6);    // 随机速度
      let size = random(20, 40);     // 随机初始大小
      let angle = random(TWO_PI);   // 随机角度
      let col = color(random(255), random(255), random(255)); // 随机颜色
      this.particles.push(new Particle(x, y, size, speed, angle, col));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.update();
      if (p.isFinished()) {
        this.particles.splice(i, 1); // 移除已消失的粒子
      }
    }

    // 所有粒子消失后结束动画
    if (this.particles.length === 0) {
      this.opacity = 0;
    }
  }

  display() {
    for (let p of this.particles) {
      p.display();
    }
  }

  isFinished() {
    return this.opacity <= 0;
  }
}

// 粒子类：用于处理单个粒子的扩散和淡出效果
class Particle {
  constructor(x, y, size, speed, angle, col) {
    this.x = x;
    this.y = y;
    this.size = size;       // 粒子大小
    this.speed = speed;      // 扩散速度
    this.angle = angle;      // 扩散角度
    this.col = col;
    this.opacity = 255;    // 透明度
  }

  update() {
    // 更新粒子位置
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
    this.size -= 0.2; // 随着时间逐渐缩小
    this.opacity -= 5; // 透明度递减
  }

  display() {
    fill(this.col, this.opacity);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }

  isFinished() {
    return this.opacity <= 0 || this.size <= 0; // 当透明度或大小小于等于 0 时，认为粒子消失
  }
}

// 动态折线效果类
class DynamicLine extends Shape {
  constructor() {
    super(0, 0, color(0)); // 颜色在显示时定义

    // 随机生成起始点和结束点的 y 坐标
    let startY = random(height); // 随机起始点 Y 坐标
    let endY = random(height);   // 随机结束点 Y 坐标

    // 随机选择折线的方向
    if (random(1) > 0.5) {
      this.start = createVector(0, startY); // 从左侧起点
      this.end = createVector(width, endY); // 右侧结束点
    } else {
      this.start = createVector(width, startY); // 从右侧起点
      this.end = createVector(0, endY);         // 左侧结束点
    }

    // 选择从上到下或从下到上的效果
    if (random(1) > 0.5) {
      // 从上到下
      this.start.y = random(-50, 0); // 确保从上方出现
      this.end.y = random(height);    // 结束点在画布内随机
    } else {
      // 从下到上
      this.start.y = random(height, height + 50); // 确保从下方出现
      this.end.y = random(0, height);             // 结束点在画布内随机
    }

    this.length = p5.Vector.dist(this.start, this.end); // 计算长度
    this.segments = 5; // 折线段数
    this.currentSegment = 0; // 当前段索引
    this.offset = 0; // 动态偏移量
  }

  update() {
    if (this.currentSegment < this.segments) {
      this.currentSegment++; // 每次更新时绘制下一个段
      this.offset += 2; // 增加偏移量
    } else {
      this.opacity -= 5; // 结束后逐渐消失
    }
  }

  display() {
    strokeWeight(5 + this.offset * 0.9); // 线宽动态变化
    stroke(lerpColor(color(0, 255, 0), color(255, 0, 0), this.currentSegment / this.segments)); // 渐变颜色

    let segmentLength = this.length / this.segments; // 每个段的长度
    for (let i = 0; i < this.currentSegment; i++) {
      let x1 = lerp(this.start.x, this.end.x, i / this.segments); // 计算每个段的起始 x
      let y1 = lerp(this.start.y, this.end.y, i / this.segments) + random(-30, 30); // 添加动态波动
      let x2 = lerp(this.start.x, this.end.x, (i + 1) / this.segments); // 计算每个段的结束 x
      let y2 = lerp(this.start.y, this.end.y, (i + 1) / this.segments) + random(-30, 30); // 添加动态波动

      line(x1, y1, x2, y2); // 绘制线段
    }
  }

  isFinished() {
    return this.opacity <= 0; // 判断是否完全消失
  }
}

// 三角形增加边长后消失
class Polygon extends Shape {
  constructor(x, y, col) {
    super(x, y, col);
    this.sides = 3; // 初始为三角形
    this.radius = 300; // 初始半径
    this.maxSides = 8; // 最大边数
    this.scale = 1; // 初始缩放比例
    this.scaleSpeed = 0.05; // 缩放速度
    this.sidesIncreaseSpeed = 0.09; // 调整这个值以控制增加边数的速度
    this.startAngle = random(TWO_PI); // 随机一个初始角度
  }

  update() {
    // 增加边数直到达到最大边数
    if (this.sides < this.maxSides) {
      this.sides += this.sidesIncreaseSpeed; // 使用 sidesIncreaseSpeed 控制增加速度
      if (this.sides > this.maxSides) {
        this.sides = this.maxSides;
      }
    } else {
      this.scale -= this.scaleSpeed; // 达到最大边数后开始缩小
    }
  }

  display() {
    fill(this.col, this.opacity);
    noStroke();
    push();
    translate(this.x, this.y); // 移动到中心位置
    scale(this.scale); // 应用缩放比例
    beginShape();
    for (let i = 0; i < floor(this.sides); i++) { // 使用 floor() 将 sides 转换为整数
      let angle = this.startAngle + TWO_PI / this.sides * i; // 以 startAngle 为初始角度旋转
      let xOffset = cos(angle) * this.radius; // 计算 x 偏移
      let yOffset = sin(angle) * this.radius; // 计算 y 偏移
      vertex(xOffset, yOffset); // 添加顶点
    }
    endShape(CLOSE); // 关闭形状
    pop();
  }

  isFinished() {
    return this.scale <= 0; // 判断是否完全消失
  }
}
