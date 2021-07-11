import { MetadataStorage, metaDataStoragePool } from "./metadata-storage";
import { TargetResolver } from "easy-peasy";
import { ToStoreType } from "./types";
import { cloneDeep } from 'lodash'

//Appeler @Model ferme l'item courant et en ouvre un autre, 
//récupère le symbole du storage et l'ajoute a la a la classe parent (celle du décorateur @Model)

export const Model: ClassDecorator = function (ctor) {

    const metadataStorage = metaDataStoragePool.getCurrentStorage()
    metadataStorage.addModelMetadata({ ctor });


    function getMergedModel() {

        //get the model def of the class own decorators
        const modelObj = metadataStorage.buildModel()

        //get the model of its parent (because of inheritance, the parent classes are evaluated first and have a .obj property)
        //No need to loop through the prototype chain as the parent itself has looked up for its grand-parent
        const parentModelObj = Object.getPrototypeOf(ctor)?.obj || {} //eq __proto__

        //The child overides the parent (we do not mutate the parent as it may be used concurrently in other models)
        const mergedModel = Object.assign({}, parentModelObj, modelObj)

        mergedModel._isHoldingChildren = metadataStorage._isHoldingChildren

        return mergedModel
    }

    //We store the model obj as a static getter (= on the class constructor)
    //We don't the result directly, we store a factory function. This way, the action and thunk function will have different refs
    Object.defineProperty(ctor, 'obj', { get: () => getMergedModel() })


    console.log("@Model " + ctor.name)

    metaDataStoragePool.next()
}





export const Property: PropertyDecorator = function (proto, fieldName) {
    console.log("@Property ", proto.constructor.name + "." + fieldName.toString())
    const metadataStorage = metaDataStoragePool.getCurrentStorage()
    metadataStorage.addPropertyMetadata({ proto, fieldName })
}


export const Child: PropertyDecorator = function (proto, fieldName) {
    console.log("@Child ", proto.constructor.name + "." + fieldName.toString())
    const metadataStorage = metaDataStoragePool.getCurrentStorage()
    metadataStorage.addChildMetadata({ proto, fieldName })
}


export const Action: MethodDecorator = function (proto, fieldName, descriptor) {
    console.log("@Action ", proto.constructor.name + "." + fieldName.toString())
    const metadataStorage = metaDataStoragePool.getCurrentStorage()
    metadataStorage.addActionMetadata({ proto, fieldName, handler: descriptor.value })
}


export const Computed: MethodDecorator = function (proto, fieldName, descriptor) {
    console.log("@Computed ", proto.constructor.name + "." + fieldName.toString())
    const metadataStorage = metaDataStoragePool.getCurrentStorage()
    metadataStorage.addComputedMetadata({ proto, fieldName, handler: descriptor.value || descriptor.get })
}


export const Thunk: MethodDecorator = function (proto, fieldName, descriptor) {
    console.log("@Thunk ", proto.constructor.name + "." + fieldName.toString())
    const metadataStorage = metaDataStoragePool.getCurrentStorage()
    metadataStorage.addThunkMetadata({ proto, fieldName, handler: descriptor.value })
}


/** 
 * equiv thunkOn
 * 
 * @example
 * \@Listener<UserTableModel,StoreModel>((actions, storeActions)=>  [storeActions.userPage.lstCities.setValue])
 * shouldRefresh(target){
 *     this.resfresh();
 * }
 */
export function Listener<Model extends object, StoreModel extends object = {}>(
    actionFn: TargetResolver<ToStoreType<Model>, ToStoreType<StoreModel>>,
): MethodDecorator {
    return function (proto, fieldName, descriptor) {
        console.log("@Listener ", proto.constructor.name + "." + fieldName.toString())
        const metadataStorage = metaDataStoragePool.getCurrentStorage()
        metadataStorage.addListenerMetadata({ proto, fieldName, handler: descriptor.value, actionFn })
    }
}