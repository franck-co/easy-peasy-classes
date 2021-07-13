import { State, Actions } from "easy-peasy";
import { ToStoreType, StateOnlyRecursive } from "./types";

type freeObj = {[key:string]:any}

interface getMapperFactoryResult<Model extends object> {
    useMapper: <Result>(mapFn: (store: ToStoreType<Model>) => Result) => ((store: any /**Must be any */) => Result);
    useMapperState: <Result>(mapFn: (store: StateOnlyRecursive<ToStoreType<Model>>) => Result) => ((store: any) => Result);
    useMapperActions: <Result>(mapFn: (store: Actions<ToStoreType<Model>>) => Result) => ((store: any) => Result);

    useMapperLoose: <Result>(mapFn: (store: Model & freeObj) => Result  & freeObj) => ((store: Model   & freeObj) => Result  & freeObj );
}


export function getMapperFactory<Model extends object>(): getMapperFactoryResult<Model> {
    return {
        useMapper: undefined,
        useMapperActions:undefined,
        useMapperState:undefined,

        useMapperLoose :undefined,
    } as any;
}

