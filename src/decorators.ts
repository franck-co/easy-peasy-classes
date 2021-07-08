import { MetadataStorage, metaDataStoragePool } from "./metadata-storage";
import { TargetResolver } from "easy-peasy";
import { ToStoreType } from "./types";
import { cloneDeep } from 'lodash'

//Appeler @Model ferme l'item courant et en ouvre un autre, 
//récupère le symbole du storage et l'ajoute a la a la classe parent (celle du décorateur @Model)

export function Model(modelName: string = 'model'):ClassDecorator {

    return function(ctor){

        const metadataStorage = metaDataStoragePool.getCurrentStorage()
        metadataStorage.addModelMetadata({ ctor, modelName });




        

        function getMergedModel(){

        //get the model def of the class own decorators
        const modelObj = metadataStorage.buildModel()

        //get the model of its parent (because of inheritance, the parent classes are evaluated first and have a .obj property)
        //No need to loop through the prototype chain as the parent itself has looked up for its grand-parent
        const parentModelObj = Object.getPrototypeOf(ctor)?.obj || {} //eq __proto__

        //The child overides the parent (we do not mutate the parent as it may be used concurrently in other models)
        const mergedModel = Object.assign({},parentModelObj,modelObj)

        mergedModel._isHoldingChildren =  metadataStorage._isHoldingChildren

        return mergedModel
        }

        //We store the model obj as a static getter (= on the class constructor)
        //We don't the result directly, we store a factory function. This way, the action and thunk function will have different refs
        Object.defineProperty(ctor, 'obj', {get: ()=> getMergedModel()})
        

        console.log("@Model " + ctor.name)

        metaDataStoragePool.next()
    }
}




export function Property():PropertyDecorator {

    return function(proto,fieldName){
        console.log("@Property ",proto.constructor.name + "." + fieldName.toString())
        const metadataStorage = metaDataStoragePool.getCurrentStorage()
        metadataStorage.addPropertyMetadata({ proto, fieldName })
    }  
}

export function Child():PropertyDecorator {

    return function(proto,fieldName){
        console.log("@Child ",proto.constructor.name + "." + fieldName.toString())
        const metadataStorage = metaDataStoragePool.getCurrentStorage()
        metadataStorage.addChildMetadata({ proto, fieldName })
    }  
}

export function Action():MethodDecorator {
    return function(proto, fieldName, descriptor){
        console.log("@Action ",proto.constructor.name + "." + fieldName.toString())
        const metadataStorage = metaDataStoragePool.getCurrentStorage()
        metadataStorage.addActionMetadata({ proto, fieldName, handler: descriptor.value })
    }
}

export function Computed():MethodDecorator {
    return function(proto, fieldName, descriptor){
        console.log("@Computed ",proto.constructor.name + "." + fieldName.toString())
        const metadataStorage = metaDataStoragePool.getCurrentStorage()
        metadataStorage.addComputedMetadata({ proto, fieldName, handler: descriptor.value || descriptor.get })
    }
}

export function Thunk():MethodDecorator {
    return function(proto, fieldName, descriptor){
        console.log("@Thunk ",proto.constructor.name + "." + fieldName.toString())
        const metadataStorage = metaDataStoragePool.getCurrentStorage()
        metadataStorage.addThunkMetadata({ proto, fieldName, handler: descriptor.value })
    }
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
):MethodDecorator {
    return function(proto, fieldName, descriptor){
        console.log("@Listener ",proto.constructor.name + "." + fieldName.toString())
        const metadataStorage = metaDataStoragePool.getCurrentStorage()
        metadataStorage.addListenerMetadata({ proto, fieldName, handler: descriptor.value, actionFn  })
    }
}



// import { MetadataStorage, metaDataStoragePool } from "./metadata-storage";
// import { TargetResolver } from "easy-peasy";
// import { ToStoreType } from "./types";
// //import any = jasmine.any;


// function metadataStorageExec(proto,mapperFn:(metadataStorage:MetadataStorage)=>void){
//     const protoExt = proto as typeof proto & any
//         let symbol = protoExt.constructor.__symbol
//         let metadataStorage

//         //Ajout si besoin d'un symbol à l'object constructor
//         //Les Decorateurs sont executés d'abord pour les properties puis pour la classe
//         if(!symbol){
//             symbol = Symbol(proto.constructor.name)
//             metadataStorage = metaDataStoragePool.createMetadataStorage(symbol)
//             protoExt.constructor.__symbol = symbol
//         }else{
//             console.log("symbo ",symbol,"trouvé !")
//             metadataStorage = metaDataStoragePool.getMetadataStorage(symbol)
//         }

//         mapperFn(metadataStorage)
// }


// export function Model(modelName: string = 'model') {

//     console.log('Class Decorator factory')

//     return <T extends { new (...args: any[]): {} }>(ctor: T) => {
        
//         const ctorExt = ctor as typeof ctor & any
//         const symbol = ctorExt.__symbol
       
//         const metadataStorage = metaDataStoragePool.getMetadataStorage(symbol)
//         metadataStorage.addModelMetadata({ ctor: ctor, modelName });

//         // Object.defineProperty(ctorExt,"obj",{
//         //     get:function(){
//         //         const metaDataStorage = metaDataStoragePool.getMetadataStorage(this.__symbol) 
//         //         return metaDataStorage.buildModel();
//         //     }
//         // })
//     };
// }

// export function Property() {
//     return ((...[proto, fieldName]: Parameters<PropertyDecorator>) => {
//         // console.log("PropertyDecorator proto : ",proto)
//         metadataStorageExec(proto,metadataStorage=>metadataStorage.addPropertyMetadata({ ctor: proto, fieldName }))
//     }) as PropertyDecorator ;
// }

// export function Child() {
//     return ((...[proto, fieldName]: Parameters<PropertyDecorator>) => {
//         // console.log("PropertyDecorator proto : ",proto)
//         metadataStorageExec(proto,metadataStorage=>metadataStorage.addPropertyMetadata({ ctor: proto, fieldName }))
//     }) as PropertyDecorator ;
// }

// export function Action<T>() {
//     return ((...[ctor, fieldName, { value }]: Parameters<MethodDecorator>) => {
//         // console.log("MethodDecorator proto : ",ctor)
//         metadataStorageExec(ctor,metadataStorage=>metadataStorage.addActionMetadata({ ctor: ctor, fieldName, handler: value }))
//     }) as MethodDecorator
// }

// export function Computed() {
//     return ((...[ctor, fieldName, { value, get }]: Parameters<MethodDecorator>) => {
//         metadataStorageExec(ctor,metadataStorage=>metadataStorage.addComputedMetadata({ ctor: ctor, fieldName, handler: value || get }))
//     }) as MethodDecorator
// }

// export function Thunk() {
//     return ((...[ctor, fieldName, { value, get }]: Parameters<MethodDecorator>) => {
//         // console.log("MethodDecorator proto : ",ctor)
//         metadataStorageExec(ctor,metadataStorage=>metadataStorage.addThunkMetadata({ ctor: ctor, fieldName, handler: value }))
//     }) as MethodDecorator
// }

// export function Listener<Model extends object, StoreModel extends object = {}>(
//     actionFn: TargetResolver<ToStoreType<Model>, ToStoreType<StoreModel>>,
// ) {
//     return ((...[ctor, fieldName, { value, get }]: Parameters<MethodDecorator>) => {
//         metadataStorageExec(ctor,metadataStorage=>metadataStorage.addListenerMetadata({ handler: value, fieldName, ctor: ctor, actionFn }))
//     }) as MethodDecorator
// }

