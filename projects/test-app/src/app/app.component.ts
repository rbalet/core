import { Component, OnInit } from "@angular/core";
import { _, TranslateDirective, TranslatePipe, TranslateService } from "@ngx-translate/core";
import { map } from 'rxjs';
import { TranslationObject } from '../../../ngx-translate/src/public-api';
import { StandaloneComponent } from "./standalone.component";


@Component({
    selector: "app-root",
    standalone: true,
    imports: [TranslateDirective, TranslatePipe, StandaloneComponent],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss"
})
export class AppComponent implements OnInit
{
    title = _("test-app");

    constructor(private translate: TranslateService) {
        this.translate.addLangs(['de', 'en']);
        this.translate.setDefaultLang('en');
        this.translate.use('en');
    }

    ngOnInit() {
      // Service Get method with a set of string[]
      this.translate
        .get(['demo.simple.text-as-attribute', 'demo.simple.text-as-content'])
        .pipe(map((arr: TranslationObject) => {
          return Object.values(arr).join(', ')
        }))
        .subscribe(console.log);
    }
}
