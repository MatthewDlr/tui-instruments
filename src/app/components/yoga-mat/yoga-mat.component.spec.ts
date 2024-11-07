import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YogaMatComponent } from './yoga-mat.component';

describe('YogaMatComponent', () => {
  let component: YogaMatComponent;
  let fixture: ComponentFixture<YogaMatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YogaMatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YogaMatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
