import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, ViewContainerRef} from "@angular/core";
import {TestBed} from "@angular/core/testing";
import {Observable, of} from "rxjs";
import {
  DefaultLangChangeEvent,
  LangChangeEvent,
  TranslateLoader,
  TranslateModule,
  TranslatePipe,
  TranslateService,
  TranslationObject
} from "../public-api";

class FakeChangeDetectorRef extends ChangeDetectorRef {
  markForCheck(): void {
    // Intentionally left empty
  }

  detach(): void {
    // Intentionally left empty
  }

  detectChanges(): void {
    // Intentionally left empty
  }

  checkNoChanges(): void {
    // Intentionally left empty
  }

  reattach(): void {
    // Intentionally left empty
  }
}

@Injectable()
@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  selector: 'app-hmx-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{'TEST' | translate}}`
})
class AppComponent {
  viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }
}

let translations: TranslationObject = {"TEST": "This is a test"};

@Injectable()
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    void lang;
    return of(translations);
  }
}

describe('TranslatePipe (modules)', () => {
  let translate: TranslateService;
  let translatePipe: TranslatePipe;
  let ref: FakeChangeDetectorRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: FakeLoader}
        })
      ],
      declarations: [AppComponent]
    });
    translate = TestBed.inject(TranslateService);
    ref = new FakeChangeDetectorRef();
    translatePipe = new TranslatePipe(translate, ref);
  });

  afterEach(() => {
    translations = {"TEST": "This is a test"};
  });

  it('is defined', () => {
    expect(TranslatePipe).toBeDefined();
    expect(translatePipe).toBeDefined();
    expect(translatePipe instanceof TranslatePipe).toBeTruthy();
  });

  it('should translate a string', () => {
    translate.setTranslation('en', {"TEST": "This is a test"});
    translate.use('en');

    expect(translatePipe.transform('TEST') as string).toEqual("This is a test");
  });

  it('should call markForChanges when it translates a string', () => {
    translate.setTranslation('en', {"TEST": "This is a test"});
    translate.use('en');
    spyOn(ref, 'markForCheck').and.callThrough();

    translatePipe.transform('TEST');
    expect(ref.markForCheck).toHaveBeenCalled();
  });

  it('should translate a string with object parameters', () => {
    translate.setTranslation('en', {"TEST": "This is a test {{param}}"});
    translate.use('en');

    expect(translatePipe.transform('TEST', {param: "with param"}) as string).toEqual("This is a test with param");
  });

  it('should translate a string with object as string parameters', () => {
    translate.setTranslation('en', {"TEST": "This is a test {{param}}"});
    translate.use('en');

    expect(translatePipe.transform('TEST', '{param: "with param"}') as string).toEqual("This is a test with param");
    expect(translatePipe.transform('TEST', '{"param": "with param"}') as string).toEqual("This is a test with param");
    expect(translatePipe.transform('TEST', "{param: 'with param'}") as string).toEqual("This is a test with param");
    expect(translatePipe.transform('TEST', "{'param' : 'with param'}") as string).toEqual("This is a test with param");
  });

  it('should translate a string with object as multiple string parameters', () => {
    translate.setTranslation('en', {"TEST": "This is a test {{param1}} {{param2}}"});
    translate.use('en');

    expect(translatePipe.transform('TEST', '{param1: "with param-1", param2: "and param-2"}') as string)
      .toEqual("This is a test with param-1 and param-2");
    expect(translatePipe.transform('TEST', '{"param1": "with param-1", "param2": "and param-2"}') as string)
      .toEqual("This is a test with param-1 and param-2");
    expect(translatePipe.transform('TEST', "{param1: 'with param-1', param2: 'and param-2'}") as string)
      .toEqual("This is a test with param-1 and param-2");
    expect(translatePipe.transform('TEST', "{'param1' : 'with param-1', 'param2': 'and param-2'}") as string)
      .toEqual("This is a test with param-1 and param-2");
  });

  it('should translate a string with object as nested string parameters', () => {
    translate.setTranslation('en', {"TEST": "This is a test {{param.one}} {{param.two}}"});
    translate.use('en');

    expect(translatePipe.transform('TEST', '{param: {one: "with param-1", two: "and param-2"}}') as string)
      .toEqual("This is a test with param-1 and param-2");
    expect(translatePipe.transform('TEST', '{"param": {"one": "with param-1", "two": "and param-2"}}') as string)
      .toEqual("This is a test with param-1 and param-2");
    expect(translatePipe.transform('TEST', "{param: {one: 'with param-1', two: 'and param-2'}}") as string)
      .toEqual("This is a test with param-1 and param-2");
    expect(translatePipe.transform('TEST', "{'param' : {'one': 'with param-1', 'two': 'and param-2'}}") as string)
      .toEqual("This is a test with param-1 and param-2");
  });

  it('should update the value when the parameters change', () => {
    translate.setTranslation('en', {"TEST": "This is a test {{param}}"});
    translate.use('en');

    spyOn(translatePipe, 'updateValue').and.callThrough();
    spyOn(ref, 'markForCheck').and.callThrough();

    expect(translatePipe.transform('TEST', {param: "with param"}) as string).toEqual("This is a test with param");
    expect(translatePipe.updateValue).toHaveBeenCalledTimes(1);

    // same value, shouldn't call 'updateValue' again
    expect(translatePipe.transform('TEST', {param: "with param"}) as string).toEqual("This is a test with param");
    expect(translatePipe.updateValue).toHaveBeenCalledTimes(1);

    // different param, should call 'updateValue'
    expect(translatePipe.transform('TEST', {param: "with param2"}) as string).toEqual("This is a test with param2");
    expect(translatePipe.updateValue).toHaveBeenCalledTimes(2);

    expect(ref.markForCheck).toHaveBeenCalledTimes(2);
  });

  it("should throw if you don't give an object parameter", () => {
    translate.setTranslation('en', {"TEST": "This is a test {{param}}"});
    translate.use('en');
    const param = 'param: "with param"';

    expect(() => {
      translatePipe.transform('TEST', param);
    }).toThrowError(`Wrong parameter in TranslatePipe. Expected a valid Object, received: ${param}`);
  });

  it("should return given falsey or non length query", () => {
    translate.setTranslation('en', {"TEST": "This is a test"});
    translate.use('en');

    expect(translatePipe.transform(null)).toBeNull();
    expect(translatePipe.transform(undefined)).toBeUndefined();
  });

  describe('should update translations on lang change', () => {
    it('with fake loader', (done) => {
      translate.setTranslation('en', {"TEST": "This is a test"});
      translate.setTranslation('fr', {"TEST": "C'est un test"});
      translate.use('en');

      expect(translatePipe.transform('TEST') as string).toEqual("This is a test");

      // this will be resolved at the next lang change
      const subscription = translate.onLangChange.subscribe((res: LangChangeEvent) => {
        expect(res.lang).toEqual('fr');
        expect(translatePipe.transform('TEST') as string).toEqual("C'est un test");
        subscription.unsubscribe();
        done();
      });

      translate.use('fr');
    });

    it('with file loader', (done) => {
      translate.use('en');
      expect(translatePipe.transform('TEST') as string).toEqual("This is a test");

      // this will be resolved at the next lang change
      const subscription = translate.onLangChange.subscribe((res: LangChangeEvent) => {
        // let it update the translations
        setTimeout(() => {
          expect(res.lang).toEqual('fr');
          expect(translatePipe.transform('TEST') as string).toEqual("C'est un test");
          subscription.unsubscribe();
          done();
        });
      });

      translations = {"TEST": "C'est un test"};
      translate.use('fr');
    });

    it('should detect changes with OnPush', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toEqual("TEST");
      translate.use('en');
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toEqual("This is a test");
    });
  });

  describe('should update translations on default lang change', () => {
    it('with fake loader', (done) => {
      translate.setTranslation('en', {"TEST": "This is a test"});
      translate.setTranslation('fr', {"TEST": "C'est un test"});
      translate.setDefaultLang('en');

      expect(translatePipe.transform('TEST') as string).toEqual("This is a test");

      // this will be resolved at the next lang change
      const subscription = translate.onDefaultLangChange.subscribe((res: DefaultLangChangeEvent) => {
        expect(res.lang).toEqual('fr');
        expect(translatePipe.transform('TEST') as string).toEqual("C'est un test");
        subscription.unsubscribe();
        done();
      });

      translate.setDefaultLang('fr');
    });

    it('with file loader', (done) => {
      translate.setDefaultLang('en');
      expect(translatePipe.transform('TEST') as string).toEqual("This is a test");

      // this will be resolved at the next lang change
      const subscription = translate.onDefaultLangChange.subscribe((res: DefaultLangChangeEvent) => {
        // let it update the translations
        setTimeout(() => {
          expect(res.lang).toEqual('fr');
          expect(translatePipe.transform('TEST') as string).toEqual("C'est un test");
          subscription.unsubscribe();
          done();
        });
      });

      translations = {"TEST": "C'est un test"};
      translate.setDefaultLang('fr');
    });

    it('should detect changes with OnPush', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toEqual("TEST");
      translate.setDefaultLang('en');
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toEqual("This is a test");
    });
  });
});
