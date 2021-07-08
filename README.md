# easy-peasy-classes

easy-peasy-classes is a simple package that gives you the abiliy to write your easy-peasy models with typescript classes and decorators. Giving you an easy and concise way to build your store and getting code autocompletion.
easy-peasy-classes is heavily inspired by erencay's easy-peasy-decorators package. The approach slithy differs in order to add some new features.

## Disclaimer
This package (and its documentation) is still under development and is not suitable for producion environment

||easy-peasy-classes|easy-peasy-decorators|
| :--- | :---: | :---: |
| No need for a duplicate definition of the model and its interface | ✓ | ✓ |
| Autocompletion when accession state and actions, even for [reusable store models](#reusablemodels) | ✓ | ✓ |
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

## <a name="reusablemodels"></a> Reusable models
A reusable models is a model wrapped in a function. This way you can duplicate it.
This is usefull if you have multiple components that have the same behaviour but not the same state values.


For exemple, with classic easy-peasy syntax :
```js
const CheckboxReusable = ()=>({
  isChecked: false,
  toggle: action((state, payload) => {
    state.isChecked = !state.isChecked);
  }),
})

export const ListModel = {
    consentmentCheckbox: CheckboxReusable(),
    newsletterCheckbox: CheckboxReusable()
}
```