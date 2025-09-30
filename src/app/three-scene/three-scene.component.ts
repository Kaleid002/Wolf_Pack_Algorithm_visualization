import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';

interface AxisScope {
  min: number;
  max: number;
}

interface Scope {
  x: AxisScope;
  y: AxisScope;
  z: AxisScope;
}

@Component({
  selector: 'app-three-scene',
  imports: [FormsModule],
  templateUrl: './three-scene.component.html',
  styleUrl: './three-scene.component.scss'
})


export class ThreeSceneComponent implements AfterViewInit {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;


  scope: Scope = {
    x: { min: 0, max: 10 },
    y: { min: 0, max: 10 },
    z: { min: 0, max: 10 }
  };
  rotateX: number = 0;
  rotateY: number = 0.001;
  scopeOffset = { x: 0, y: 0, z: 0 };
  colorMap = {
    alpha: "#ff0000ff",
    beta: "#a79700ff",
    delta: "#003482ff"
  };
  pointColor: string = '#000000ff';
  backgroundColor: string = '#ffffff';
  isAnimating: boolean = true;
  isDragging: boolean = false;
  previousMousePosition: { x: number; y: number; } = { x: 0, y: 0 };

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private pointMaterial!: THREE.PointsMaterial;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.updateScope();
    this.animate();
  }

  //初始化Three
  protected initThree(): void {
    // 場景
    this.scene = new THREE.Scene();

    // 相機
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.backgroundColor = '#ffffff';
    this.renderer.setClearColor(new THREE.Color(this.backgroundColor), 1);

    //狼群座標(首領、隨從、狼群)
    const wolfData = {
      alpha: { x: 1, y: 2, z: 3 },
      delta: { x: 4, y: 5, z: 6 },
      beta: { x: 7, y: 8, z: 9 },
      n: [
        { x: 1, y: 1, z: 1 },
        { x: 2, y: 2, z: 2 },
        { x: 3, y: 3, z: 3 },
        { x: 50, y: 10, z: 5 }
      ]
    };

    // 3D點雲
    const createGeometry = (data: { x: number; y: number; z: number }[]) => {
      const positions = new Float32Array(data.flatMap(p => [p.x, p.y, p.z]));
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      return geometry;
    };

    //group
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    this.scene.add(this.group);

    //xyz空間軸線
    const xLine = this.createAxisLine(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 0, 0),
      0xff0000
    );

    const yLine = this.createAxisLine(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 10, 0),
      0x00ff00
    );


    const zLine = this.createAxisLine(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 10),
      0x0000ff
    );

    this.group.add(xLine, yLine, zLine);

    //xyz軸線標記
    const xLabel = this.createTextSprite('X', '#ff0000');
    xLabel.position.set(10.5, 0, 0);

    const yLabel = this.createTextSprite('Y', '#00ff00');
    yLabel.position.set(0, 10.5, 0);

    const zLabel = this.createTextSprite('Z', '#0000ff');
    zLabel.position.set(0, 0, 10.5);

    this.group.add(xLabel, yLabel, zLabel);

    //網格
    const gridLines = this.generateGridLines();
    this.group.add(gridLines);

    // 領頭狼、隨從狼
    (['alpha', 'beta', 'delta'] as const).forEach(key => {
      const L_geometry = createGeometry([wolfData[key]]);
      const fixedMaterial = new THREE.PointsMaterial({
        size: 0.8,
        map: this.generateCircleTexture(this.colorMap[key]),
        transparent: true,
      });
      const L_point = new THREE.Points(L_geometry, fixedMaterial);
      this.group.add(L_point);
    });

    // 狼群
    const n_Geometry = createGeometry(wolfData.n);
    this.pointMaterial = new THREE.PointsMaterial({
      size: 0.5,
      map: this.generateCircleTexture(this.pointColor),
      transparent: true,
    });
    const n_Points = new THREE.Points(n_Geometry, this.pointMaterial);
    this.group.add(n_Points);
  }

  //空間邊界
  createAxisLine(start: THREE.Vector3, end: THREE.Vector3, color: number) {

    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geometry, material);
  }

  //更新區域大小
  updateScope(event?: Event): void {
    if (event) event.preventDefault();

    this.camera.position.set(5, 5, 20);
  }

  //網格
  private generateGridLines(): THREE.LineSegments {
    const vertices: number[] = [];
    const step = 1;

    // XY 平面上的 Z 軸線
    for (let z = this.scope.z.min; z <= this.scope.z.max; z += step) {
      for (let x = this.scope.x.min; x <= this.scope.x.max; x += step) {
        vertices.push(x, this.scope.y.min, z);
        vertices.push(x, this.scope.y.max, z);
      }
      for (let y = this.scope.y.min; y <= this.scope.y.max; y += step) {
        vertices.push(this.scope.x.min, y, z);
        vertices.push(this.scope.x.max, y, z);
      }
    }

    // YZ 平面上的 X 軸線
    for (let x = this.scope.x.min; x <= this.scope.x.max; x += step) {
      for (let y = this.scope.y.min; y <= this.scope.y.max; y += step) {
        vertices.push(x, y, this.scope.z.min);
        vertices.push(x, y, this.scope.z.max);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.3
    }); return new THREE.LineSegments(geometry, material);
  };

  //旋轉動畫
  private animate = () => {
    requestAnimationFrame(this.animate);

    if (this.isAnimating && this.group) {
      this.group.rotation.x += this.rotateX;
      this.group.rotation.y += this.rotateY;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  // 建立圓形貼圖
  private generateCircleTexture(fillColor: string): THREE.Texture {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  //建立文字貼圖
  private createTextSprite(text: string, color: string = '#000000'): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const size = 128;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 2, 2);
    return sprite;
  };

  //點 顏色更改
  updatePointColor(): void {
    if (this.pointMaterial) {
      this.pointMaterial.map = this.generateCircleTexture(this.pointColor);
      this.pointMaterial.needsUpdate = true;
    }
  }

  //背景 顏色更改
  updateBackgroundColor(): void {
    if (this.renderer) {
      this.renderer.setClearColor(this.backgroundColor);
    }
  }

  toggleAnimation(): void {
    this.isAnimating = !this.isAnimating;
  }

  //   HostListener 綁事件
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!(event.target instanceof HTMLCanvasElement)) return;
    this.isAnimating = false;
    this.isDragging = true;
    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.group) return;

    const dx = event.clientX - this.previousMousePosition.x;
    const dy = event.clientY - this.previousMousePosition.y;

    const rotateSpeed = 0.005;
    this.group.rotation.y += dx * rotateSpeed;
    this.group.rotation.x += dy * rotateSpeed;

    this.group.position.set(
      this.scopeOffset.x,
      this.scopeOffset.y,
      this.scopeOffset.z
    );

    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }
}
