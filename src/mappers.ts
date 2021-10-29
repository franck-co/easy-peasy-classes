import * as easyPeasy from "easy-peasy";
import { ToStoreType, StateOnlyRecursive } from "./types";

interface getMapperFactoryResult<Model extends object> {
    useMapper: <Result>(mapFn: (store: ToStoreType<Model>) => Result) => (<S extends easyPeasy.Actions<ToStoreType<Model>> | easyPeasy.State<ToStoreType<Model>>>(store: S) => Result extends object ? S extends easyPeasy.Actions<ToStoreType<Model>> ? easyPeasy.Actions<Result> : easyPeasy.State<Result> : Result);
    // useMapperState: <Result>(mapFn: (store: easyPeasy.State<ToStoreType<Model>>) => Result) => ((store: any) => Result);
    // useMapperActions: <Result>(mapFn: (store: easyPeasy.Actions<ToStoreType<Model>>) => Result) => ((store: any) => Result);

    // useMapperLoose: <Result>(mapFn: (store: Model & freeObj) => Result  & freeObj) => ((store: Model   & freeObj) => Result  & freeObj );
}


export function getMapperFactory<Model extends object>(): getMapperFactoryResult<Model> {
    return {
        useMapper: (i:any) => i,
        // useMapperActions:(i:any) => i,
        // useMapperState:(i:any) => i,

        // useMapperLoose :(i:any) => i,
    } as any;
}

