import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeSceneComponent } from './three-scene.component';

describe('ThreeSceneComponent(unit)', () => {
  let component: ThreeSceneComponent;
  let fixture: ComponentFixture<ThreeSceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeSceneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a canvas element in template',()=>{
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('canvas')).toBeTruthy();
  });

  it('should call initScene after view init',()=>{
    const spy = spyOn<any>(component,'initScene');
    component.ngAfterViewInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should toggle animation state',()=>{
    const initial = component.isAnimating;
    component.toggleAnimation();
    expect(component.isAnimating).toBe(!initial);
  });
});
