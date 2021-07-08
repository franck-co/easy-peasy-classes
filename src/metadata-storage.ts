import { action, actionOn, computed, TargetResolver, thunk, thunkOn } from "easy-peasy";
// import deepFreeze from 'deep-freeze'
import {cloneDeep, merge} from 'lodash'
//import deepUnfreeze from 'deep-unfreeze';

interface IModelMetadata {
    ctor: any;
    modelName: string;
}

interface IModelDefinition{
    proto: any;
    modelName: string;
}

interface IPropertyMetadata {
    proto: any;
    fieldName: any;
    initialValue?: any;
}
type IChildMetadata = IPropertyMetadata

interface IMethodMetadata {
    proto: any;
    fieldName: any;
    handler: any;
}
interface IActionMetadata extends IMethodMetadata {}
interface IComputedMetadata extends IMethodMetadata {}
interface IThunkMetadata extends IMethodMetadata {}
interface IListenerMetadata extends IMethodMetadata {
    actionFn: any;
}

interface IModelInstance {
    proto: any;
    instance: any;
}

export class MetadataStorage {
    private model: Record<string, Record<string, any>> = {};
    private models: IModelDefinition[] = [];
    private properties: IPropertyMetadata[] = [];
    private children: IChildMetadata[] = [];
    private actions: IActionMetadata[] = [];
    private computed: IComputedMetadata[] = [];
    private listeners: IListenerMetadata[] = [];
    private thunks: IThunkMetadata[] = [];
    private instances: IModelInstance[] = [];

    public _isHoldingChildren:boolean = false

    public addModelMetadata(definition: IModelMetadata) {
        this.models.push({ proto: definition.ctor.prototype, modelName: definition.modelName });
        this.instances.push({ proto: definition.ctor.prototype, instance: new definition.ctor() });
    }

    public addPropertyMetadata(definition: IPropertyMetadata) {
        this.properties.push(definition);
    }

    public addChildMetadata(definition: IChildMetadata) {
        this.children.push(definition);
    }

    public addActionMetadata(definition: IActionMetadata) {
        this.actions.push(definition);
    }

    public addComputedMetadata(definition: IComputedMetadata) {
        this.computed.push(definition);
    }

    public addListenerMetadata(definition: IListenerMetadata) {
        this.listeners.push(definition);
    }

    public addThunkMetadata(definition: IThunkMetadata) {
        this.thunks.push(definition);
    }

    public buildModel(withModelName=false) {
        this.models.forEach(({ proto, modelName }) => {
            
        
            this.model[modelName] = {};

            this.properties
                .filter(p => p.proto === proto)
                .forEach(p => {
                    const instance = this.instances.find(i => i.proto === p.proto);
                    const  initialValue = instance?.instance[p.fieldName];

                    this.model[modelName][p.fieldName] = initialValue;
                });
            
            this.children
                .filter(p => p.proto === proto)
                .forEach(p => {
                    this._isHoldingChildren = true
                    const instance = this.instances.find(i => i.proto === p.proto);
                    const  initialValue = instance?.instance[p.fieldName];

                    this.model[modelName][p.fieldName] = initialValue;
                });

            this.actions
                .filter(a => a.proto === proto)
                .forEach(a => {
                    this.model[modelName][a.fieldName] = action((state, payload) => {
                        try{
                            a.handler.call(state, payload);
                        }catch(err){
                            if(err instanceof TypeError && err.message === "this.getStoreActions is not a function") throw new Error("this.getStoreActions() can only be used in a Thunk.\nIf you used an Action, you should probably add a separate Thunk to do your business logic and keep your actions granular.")
                            if(err instanceof TypeError && err.message === "this.getStoreState is not a function") throw new Error("this.getStoreState() can only be used in a Thunk.\nIf you used an Action, you should probably add a separate Thunk to do your business logic and keep your actions granular.")
                            if(err instanceof TypeError && err.message === "this.getStoreStateClone is not a function") throw new Error("this.getStoreStateClone() can only be used in a Thunk.\nIf you used an Action, you should probably add a separate Thunk to do your business logic and keep your actions granular.")
                            if(err instanceof TypeError && err.message === "this.getStateClone is not a function") throw new Error("this.getStateClone() can only be used in a Thunk.\nIf you used an Action, you should probably add a separate Thunk to do your business logic and keep your actions granular.")
                            else throw err
                        }
                       
                    });
                });

            this.computed
                .filter(c => c.proto === proto)
                .forEach(c => {
                    this.model[modelName][c.fieldName] = computed(state => {
                        return c.handler.call(state);
                    });
                });

            this.listeners
                .filter(l => l.proto === proto)
                .forEach(l => {
                    this.model[modelName][l.fieldName] = thunkOn(l.actionFn, (actions, target,{getState,getStoreActions,getStoreState}) => {
                        
                        function getStoreStateClone(mapState:any){
                            const selectedState = mapState(getStoreState())
                            return cloneDeep(selectedState)
                        }

                        function getStateClone(){
                            const modelState = getStoreState()
                            return cloneDeep(modelState)
                        }
                        
                        return l.handler.call({ ...getState(), ...actions,
                            getStoreActions,
                            getStoreState,

                            getStateClone,
                            getStoreStateClone,
                            
                         }, target);
                    });
                });

            this.thunks
                .filter(t => t.proto === proto)
                .forEach(t => {
                    this.model[modelName][t.fieldName] = thunk((actions, payload, { getState,getStoreActions,getStoreState }) => {

                        //As the state is frozen, it not a danger anymore to provide raw state to Thunks
                        //The copied unFrozen state is provided as an utility

                        function getStoreStateClone(mapState:any){
                            const selectedState = mapState(getStoreState())
                            return cloneDeep(selectedState)
                        }

                        function getStateClone(mapState:any){
                            const selectedState = mapState(getStoreState())
                            return cloneDeep(selectedState)
                        }

                        return t.handler.call({ 
                            ...merge({},actions,getState()),
                            getStoreActions,
                            getStoreState,

                            getStateClone,
                            getStoreStateClone,
                            
                         }, payload);
                       
                    });
                });

            if(!withModelName){
                this.model = this.model[modelName]
            }
        });

        return this.model as any;
    }
}


class  MetadataStoragePool {

    pool: Array<MetadataStorage> = []
    currentIndex:number = 0

    constructor(){
        this.pool[0] = new MetadataStorage()
    }


    // getMetadataStorage(key:string | Symbol):MetadataStorage{

    //     //Because typescript type system doesn't support Symbol as index type for arrays
    //     const tsFixKey = key as unknown as string

    //     return this.pool[tsFixKey] 
    // }

    
    // createMetadataStorage(key:string | Symbol):MetadataStorage{

    //     //Because typescript type system doesn't support Symbol as index type for arrays
    //     const tsFixKey = key as unknown as string

    //     this.pool[tsFixKey] = new MetadataStorage();
    //     return this.getMetadataStorage(key)
    // }


    next(){
        this.currentIndex++
        this.pool[this.currentIndex] = new MetadataStorage();
        console.log("listning for new decorators (storageIndex : " + this.currentIndex + ")")
    }

    getCurrentIndex(){
        return this.currentIndex
    }

    getCurrentStorage(){
        return this.pool[this.currentIndex]
    }

    getStorageByIndex(index:any){
        return this.pool[index]
    }


}

export const metaDataStoragePool = new MetadataStoragePool();



// this.thunks
// .filter(t => t.proto === proto)
// .forEach(t => {
//     this.model[modelName][t.fieldName] = thunk((actions, payload, { getState,getStoreActions,getStoreState }) => {

//         function getStoreState2(mapState){
//             const selectedState = mapState(getStoreState())
//             return deepFreeze(cloneDeep(selectedState))
//         }

//         function getStoreAction2(mapActions){
//             const selectedActions = mapActions(getStoreActions())
//             return selectedActions
//         }
        
//         const freezedLocalState = deepFreeze(cloneDeep(getState()))  // produce(getState(),draft=>draft)

//         return t.handler.call({ ...freezedLocalState, ...actions,
//             getStoreActions: getStoreAction2, //Mix of easy-peay syntax and map syntax
//             getStoreState:getStoreState2, //Map syntax

//             getStoreActionsRaw:getStoreActions,
//             getStoreStateRaw:getStoreState,
//             getStateRaw:getState
//          }, payload);
       
//     });
// });
