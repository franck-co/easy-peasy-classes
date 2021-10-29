# easy-peasy-classes

easy-peasy-classes is a simple package that gives you the abiliy to write your easy-peasy models with typescript classes and decorators. Giving you an easy and concise way to build your store and getting code autocompletion + type safety.
easy-peasy-classes is heavily inspired by erencay's easy-peasy-decorators package. The approach slithy differs in order to add some new features.

## Disclaimer
This package (and its documentation) is still under development and is not suitable for use yet.

||easy-peasy-classes|easy-peasy-decorators|
| :--- | :---: | :---: |
| No need for a duplicate definition of the model and its interface | ✓ | ✓ |
| Autocompletion when accessing state and actions, even for [reusable store models](#reusablemodels) | ✓ | ✓ |
| No need to import/export your models throughout your project | - | ✓ |
| No need to extend every model from a base class | - | ✓ |
| Ability to mix with classic easy-peasy model definitions | ✓ | - |
| Convenient for deeply nested store structure | ✓ | - |
| Ability to define resusable models | ✓ | - |
| Class inheritence for models / Definition | ✓ | - |
| this.getStoreState() and this.getStoreActions() helpers | ✓ | - |
|Possibilty to define a this.resetState() helper| ✓ | - |

## Installation

```
npm install easy-peasy easy-peasy-classes
# or
yarn add easy-peasy easy-peasy-classes
```

## Basic usage
easy-peasy-classes comes with 7 decorators

|     |     |
| --- | --- |
|@Model|Required on top of __every__ class model|
|@Property|State value or sub-model|
|@Child|Same as @Property but enforce that useStoreState hook will get every @Property or @Child individually. More details [here](#child) |
|@Action||
|@Thunk||
|@Computed||
|@Listener()||

## <a name="reusablemodels"></a> Reusable models
In classic easy-peasy, a reusable models is a model wrapped in a function. This way you can duplicate it.
This is usefull if you have multiple components that have the same behaviour but not the same state values.
<br>

With classic easy-peasy syntax 
```js
//Reusable model definition
const CheckboxReusable = ()=>({
  isChecked: false,
  toggle: action((state, payload) => {
    state.isChecked = !state.isChecked);
  }),
})

//Usage in a parent model
export const ListModel = {
    consentmentCheckbox: CheckboxReusable(),
    newsletterCheckbox: CheckboxReusable()
}
```
<br>
With easy-peasy-classes

```js
//Reusable model definition
@Model
class CheckboxReusable extends BaseModel {

    @Property
    isChecked: boolean = false

    @Action
    toggle(){
        this.isChecked = !this.isChecked
    }
}

//Usage in a parent model
@Model
export class ListModel extends BaseModel{
    
    @Child
    consentmentCheckbox: CheckboxReusable = CheckboxReusable.obj
    
    
    @Child
    newsletterCheckbox: CheckboxReusable = CheckboxReusable.obj
    
}


//or  with classic easy-peasy
export const ListModel = {
    consentmentCheckbox: CheckboxReusable.obj as CheckboxReusable,
    newsletterCheckbox: CheckboxReusable.obj as CheckboxReusable
}




```

## <a name="child"></a> @Child