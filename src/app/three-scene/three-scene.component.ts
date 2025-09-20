import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';

@Component({
  selector: 'app-three-scene',
  imports: [FormsModule],
  templateUrl: './three-scene.component.html',
  styleUrl: './three-scene.component.scss'
})
export class ThreeSceneComponent implements AfterViewInit {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  rotateX: number = 0.001;
  rotateY: number = 0.001;
  pointColor: string = '#ff0000';
  backgroundColor: string = '#000000';
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
    this.animate();
  }

  //初始化Three
  private initThree(): void {
    // 場景
    this.scene = new THREE.Scene();

    // 相機
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    const Points = [
      [0.000, 0.000, 1.000],
      [0.309, 0.000, 0.951],
      [-0.309, 0.000, 0.951],
      [0.000, 0.309, 0.951],
      [0.000, -0.309, 0.951],
      [0.588, 0.000, 0.809],
      [-0.588, 0.000, 0.809],
      [0.000, 0.588, 0.809],
      [0.000, -0.588, 0.809],
      [0.951, 0.000, 0.309],
      [-0.951, 0.000, 0.309],
      [0.000, 0.951, 0.309],
      [0.000, -0.951, 0.309],
      [1.000, 0.000, 0.000],
      [-1.000, 0.000, 0.000],
      [0.000, 1.000, 0.000],
      [0.951, 0.000, -0.309],
      [-0.951, 0.000, -0.309],
      [0.000, 0.951, -0.309],
      [0.000, -0.951, -0.309],
      [0.809, 0.000, -0.588],
      [-0.809, 0.000, -0.588],
      [0.000, 0.809, -0.588],
      [0.000, -0.809, -0.588],
      [0.588, 0.000, -0.809],
      [-0.588, 0.000, -0.809],
      [0.000, 0.588, -0.809],
      [0.000, -0.588, -0.809],
      [0.309, 0.000, -0.951],
      [-0.309, 0.000, -0.951],
      [0.000, 0.309, -0.951],
      [0.000, -0.309, -0.951],
      [0.000, 0.000, -1.000],
      [0.707, 0.707, 0.000],
      [-0.707, 0.707, 0.000],
      [0.707, -0.707, 0.000],
      [-0.707, -0.707, 0.000],
      [0.500, 0.500, 0.707],
      [-0.500, 0.500, 0.707],
      [0.500, -0.500, 0.707],
      [-0.500, -0.500, 0.707],
      [0.500, 0.500, -0.707],
      [-0.500, 0.500, -0.707],
      [0.500, -0.500, -0.707],
      [-0.500, -0.500, -0.707],
      [0.866, 0.000, 0.500],
      [-0.866, 0.000, 0.500],
      [0.000, 0.866, 0.500],
      [0.000, -0.866, 0.500],
      [0.866, 0.000, -0.500],
      [-0.866, 0.000, -0.500],
      [0.000, 0.866, -0.500],
      [0.000, -0.866, -0.500],
      [0.965, 0.258, 0.000],
      [-0.965, 0.258, 0.000],
      [0.965, -0.258, 0.000],
      [-0.965, -0.258, 0.000],
      [0.258, 0.965, 0.000],
      [-0.258, 0.965, 0.000],
      [0.258, -0.965, 0.000],
      [-0.258, -0.965, 0.000],
      [0.258, 0.000, 0.965],
      [-0.258, 0.000, 0.965],
      [0.000, 0.258, 0.965],
      [0.000, -0.258, 0.965],
      [0.258, 0.000, -0.965],
      [-0.258, 0.000, -0.965],
      [0.000, 0.258, -0.965],
      [0.000, -0.258, -0.965],
      [0.577, 0.577, 0.577],
      [-0.577, 0.577, 0.577],
      [0.577, -0.577, 0.577],
      [-0.577, -0.577, 0.577],
      [0.577, 0.577, -0.577],
      [-0.577, 0.577, -0.577],
      [0.577, -0.577, -0.577],
      [-0.577, -0.577, -0.577],
      [0.866, 0.500, 0.000],
      [-0.866, 0.500, 0.000],
      [0.866, -0.500, 0.000],
      [-0.866, -0.500, 0.000],
      [0.000, 0.866, 0.500],
      [0.000, -0.866, 0.500],
      [0.000, 0.866, -0.500],
      [0.000, -0.866, -0.500],
      [0.500, 0.000, 0.866],
      [-0.500, 0.000, 0.866],
      [0.500, 0.000, -0.866],
      [-0.500, 0.000, -0.866],
      [0.000, 0.500, 0.866],
      [0.000, -0.500, 0.866],
      [0.000, 0.500, -0.866],
    ];

    // 3D點雲
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(Points.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    //group
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.pointMaterial = new THREE.PointsMaterial({
      size: 0.1,
      map: this.generateCircleTexture(),
      transparent: true,
      color: new THREE.Color(this.pointColor),
    });
    const points = new THREE.Points(geometry, this.pointMaterial);
    this.group.add(points);

    //手操監聽
    this.canvas.addEventListener('mousedown', (event) => {
      this.isAnimating = false;
      this.isDragging = true;
      this.previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('mousemove', (event) => {
      if (!this.isDragging) return;

      const dx = event.clientX - this.previousMousePosition.x;
      const dy = event.clientY - this.previousMousePosition.y;

      const rotationSpeed = 0.005;
      this.group.rotation.y += dx * rotationSpeed;
      this.group.rotation.x += dy * rotationSpeed;

      this.previousMousePosition = { x: event.clientX, y: event.clientY };
    });
  }

  //旋轉動畫
  private animate = () => {
    requestAnimationFrame(this.animate);

    if (this.isAnimating) {
      this.group.rotation.x += this.rotateX;
      this.group.rotation.y += this.rotateY;
    }

    this.renderer.render(this.scene, this.camera);
  };

  // 建立圓形貼圖
  private generateCircleTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = this.pointColor;
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  //點 顏色更改
  updatePointColor(): void {
    if (this.pointMaterial) {
      this.pointMaterial.color.set(this.pointColor);
      this.pointMaterial.map = this.generateCircleTexture();
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
}
