import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Rx';

import {Meal} from '../meal';

import {Price} from '../meal/price.model';

import {MealSet} from '../meal-set/meal-set.model';

import {MealProvider} from './meal-provider.model';

import {XpathService} from '../xpath/xpath.service';

const KEY_MEAL_PROVIDERS = 'mealProviders';

@Injectable()
export class MealProviderService {

  constructor(private xpathService: XpathService) {
    this.init();
  }

  init() {
    // create mock data
    //TODO remove if meal provider can be added
    this.cacheMealProviders([
      new MealProvider(
        'Bonnie',
        'http://www.bonnierestro.hu',
        {
          phone:'+36307443555'
        },
        'http://www.bonnierestro.hu/hu/napimenu/',
        {'': ''},
        {'': [
          '//div[@id="content"]//h4[text()[contains(.,"09")]]/following-sibling::table[4]//tr[2]/td[3]',
          '//div[@id="content"]//h4[text()[contains(.,"09")]]/following-sibling::table[4]//tr[3]/td[3]',
        ]},
        {'': ''},
        {
          lat: 47.4921,
          lng: 19.0560
        },
        '55e5e5'
      ),
      new MealProvider(
        'Chic-to-Chic',
        'http://www.chictochic.hu',
        {
          address: '1056 Budapest, Irányi u. 27.',
          phone:'+3612670331'
        },
        'http://www.chictochic.hu/?nav=daily',
        {'1': '//*[@id="content-text"]/table[2]//td[contains(text(),"Csütörtök")]/../following-sibling::tr[1]/td[2]/b'},
        {'1': [
          '//*[@id="content-text"]/table[2]//td[contains(text(),"Csütörtök")]/../following-sibling::tr[1]/td[2]/div'
        ]},
        {'1': '//*[@id="content-text"]/table[2]//td[contains(text(),"Csütörtök")]/../following-sibling::tr[1]/td[3]'},
        {
          lat: 47.4918,
          lng: 19.0541
        },
        'ff5b9c'
      )
    ]);
  }


  public cacheMealProviders(mealProviders:MealProvider[]) {
    localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(mealProviders));
  }

  public getCachedMealProviders():MealProvider[] {
    var mealProviderString = localStorage.getItem(KEY_MEAL_PROVIDERS);
    if (mealProviderString) {
      try {
        return JSON.parse(mealProviderString);
      }
      catch (e) {
        console.log(e);
      }
    }
    return [];
  }

  public getDailyMealsByMealProviders() : Observable<Array<MealProvider>> {
    return Observable.of(this.getCachedMealProviders())
    .flatMap((mealProvider)=>mealProvider)
    .map((provider:MealProvider)=>{
      var xpaths:string[] = [];
      for (var key in provider.dailyMealQueryXPathByMealSet) {
        xpaths.push(provider.mealSetQueryXPath[key]);
        xpaths = [...xpaths, ...provider.dailyMealQueryXPathByMealSet[key], provider.mealSetPriceQueryXPathByMealSet[key]];
      }
      this.xpathService.resolveXPaths(provider.dailyMealUrl, ...xpaths).subscribe((res)=> {
        let mealSets:MealSet[] = [];

        for (var mealSetKey in provider.mealSetQueryXPath) {
          let meals: Meal[] = [];
          for (var mealXPath of provider.dailyMealQueryXPathByMealSet[mealSetKey]) {
            meals.push(new Meal(res[mealXPath].trim()));
          }
          console.log("*****" + JSON.stringify(meals));
          let price: Price = null;
          if (provider.mealSetPriceQueryXPathByMealSet[mealSetKey]) {
            console.log("******xpath:" + provider.mealSetPriceQueryXPathByMealSet[mealSetKey]);
            price = Price.fromString(res[provider.mealSetPriceQueryXPathByMealSet[mealSetKey]]);
            console.log("*****price:" + JSON.stringify(price));
          }
          let mealSet: MealSet = new MealSet(res[provider.mealSetQueryXPath[mealSetKey]], meals, price, provider);
          mealSets.push(mealSet);
        }
        console.log("*****" + JSON.stringify(mealSets));
        provider.mealSets = mealSets;
      });
      return provider;
    })
    .reduce((ar:MealProvider[], provider:MealProvider)=>{
      ar.push(provider);
      return ar;
    }, new Array<MealProvider>());

  }


    public getDailyMeals() : Observable<Array<MealSet>> {
      //TODO vanti1980
      return Observable.of(new Array<MealSet>());
    }

}
