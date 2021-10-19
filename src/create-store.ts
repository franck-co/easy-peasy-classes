import * as easyPeasy from "easy-peasy";
import {  ToStoreType } from './types';
//import { metadataStorage } from "./metadata-storage";


//get better typeping for getState() and getActions()
export function createStore<T extends object = {}>(storeModel:T,config?:easyPeasy.EasyPeasyConfig) {

    const store = easyPeasy.createStore<any>(storeModel,config);
    return store as easyPeasy.Store<ToStoreType<T>>;
    
}

type freeObj =  {[key:string]:any}




interface createTypedHooksReturn<Model extends object> {
    useStoreActions: <Result>(
        mapActions: (actions: easyPeasy.Actions<ToStoreType<Model>>) => Result,
    ) => Result
    useStoreActionsLoose: <Result extends Function>(
        mapActions: (actions: easyPeasy.Actions<ToStoreType<Model>> & freeObj) => Result & any,
    ) => Result
    useStoreState: <Result>(
        mapState: (state:  easyPeasy.State<ToStoreType<Model>>) => Result,
        dependencies?: any[],
    ) =>Result
    useStoreStateLoose: <Result>(
        mapState: (state: easyPeasy.State<ToStoreType<Model>> & freeObj) => Result,
        dependencies?: any[],
    ) => Result
    useStoreDispatch: () => easyPeasy.Dispatch<ToStoreType<Model>>;

}

export type getStoreState_<Model extends object> = <Result>(
    mapState: (state:  easyPeasy.State<ToStoreType<Model>>) => Result,
    dependencies?: any[],
) => Result

export type getStoreActions_<Model extends object> = <Result>(
    mapActions: (actions: easyPeasy.Actions<ToStoreType<Model>>) => Result,
) => Result

export function createTypedHooks<Model extends object>(): createTypedHooksReturn<Model> {
    
    const hooks = easyPeasy.createTypedHooks<any>();

    function secureUseStoreState(mapState:any){
        const selectedState = hooks.useStoreState(mapState) as any

        //If the selected state is marked as conaining one or more @Child(), the it shouldn't be accessed. The children should be accessed individually
        if(selectedState?._isHoldingChildren){
            throw new Error(`The selected state located at ${mapState.toString()} contains one or more @Child() properties and it shouldn't be accessed. Its properties should be accessed individually.`)
        }

        return selectedState
    }

    return {
        useStoreActions: hooks.useStoreActions,
        useStoreActionsLoose: hooks.useStoreActions,
        useStoreState: secureUseStoreState,
        useStoreStateLoose: hooks.useStoreState,
        useStoreDispatch:hooks.useStoreDispatch
    } as any;
}







// interface createLocalTypedHooksReturn<LocalModel extends object> {
//     useStoreActions: <Result>(
//         mapActions: (actions: easyPeasy.Actions<ToStoreType<LocalModel>>) => Result,
//     ) => Result;
//     useStoreActionsLoose: <Result>(
//         mapActions: (actions: easyPeasy.Actions<ToStoreType<LocalModel>> & freeObj) => Result,
//     ) => Result;
//     useStoreState: <Result>(
//         mapState: (state: ToStoreType<LocalModel>) => Result,
//         dependencies?: any[],
//     ) => Result;
//     useStoreStateLoose: <Result>(
//         mapState: (state: ToStoreType<LocalModel> & freeObj) => Result,
//         dependencies?: any[],
//     ) => Result;
//     useStoreDispatch: () => easyPeasy.Dispatch<ToStoreType<LocalModel>>;

// }


// type HolderMapFn<StoreModel extends object> = (store: ToStoreType<StoreModel>) => object

// export function createLocalHooks<StoreModel extends object, LocalModel  extends object>(holderMapFn : HolderMapFn<StoreModel>): createLocalTypedHooksReturn<LocalModel> {
    
//     const hooks = easyPeasy.createTypedHooks<any>();

//     return {
//         useStoreActions: (localMapFn)=> hooks.useStoreActions(store  =>localMapFn(holderMapFn(store as ToStoreType<StoreModel>))),
//         useStoreActionsLoose: hooks.useStoreActions,
//         useStoreState: hooks.useStoreState,
//         useStoreStateLoose: hooks.useStoreState,
//         useStoreDispatch:hooks.useStoreDispatch
//     } as any;
// }




interface createLocalTypedHooksReturn<LocalModel extends object> {
    useLocalActions: <Result>(
        mapActions: (actions: easyPeasy.Actions<ToStoreType<LocalModel>>) => Result,
    ) => Result;
    useLocalActionsLoose: <Result>(
        mapActions: (actions: easyPeasy.Actions<ToStoreType<LocalModel>> & freeObj) => Result,
    ) => Result;
    useLocalState: <Result>(
        mapState?: (state: easyPeasy.State<ToStoreType<LocalModel>>) => Result,
        dependencies?: any[],
    ) => Result;
    useLocalStateLoose: <Result>(
        mapState: (state: easyPeasy.State<ToStoreType<LocalModel>> & freeObj) => Result,
        dependencies?: any[],
    ) => Result;

}


type HolderMapFn<StoreModel extends object> = (store: ToStoreType<StoreModel>) => object;



export function createLocalHooksFactory<StoreModel extends object>(hooks:any){

return function createLocalHooks<LocalModel  extends object>(holderMapFn : HolderMapFn<StoreModel>): createLocalTypedHooksReturn<LocalModel> {
    
    //const hooks = easyPeasy.createTypedHooks<any>();

    return {
        useLocalActions: (localMapFn = ((S:any)=>S))=> hooks.useStoreActions((store:any)  =>localMapFn(holderMapFn(store as ToStoreType<StoreModel>))),
        useLocalActionsLoose: (localMapFn = (S:any)=>S)=> hooks.useStoreActions((store:any)  =>localMapFn(holderMapFn(store as ToStoreType<StoreModel>))),
        useLocalState: (localMapFn = (S:any)=>S)=> hooks.useStoreState((store:any)  =>localMapFn(holderMapFn(store as ToStoreType<StoreModel>))),
        useLocalStateLoose: (localMapFn = (S:any)=>S)=> hooks.useStoreState((store:any)  =>localMapFn(holderMapFn(store as ToStoreType<StoreModel>))),
    } as any;
}
}

//Peut être faire createLocalHooks et createLocalHooksLoose pour que la holderMapFn soit puisse être loose

