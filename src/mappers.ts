import { State, Actions } from "easy-peasy";
import { ToStoreType } from "./types";

type freeObj = {[key:string]:any}

interface getMapperFactoryResult<Model extends object> {
    useMapper: <Result>(mapFn: (store: ToStoreType<Model>) => Result) => ((store: any /**Must be any */) => Result extends ToStoreType<infer R> ? R : Result);
    useMapperState: <Result>(mapFn: (store: State<ToStoreType<Model>>) => Result) => ((store: any) => Result extends ToStoreType<infer R> ? R : Result);
    useMapperActions: <Result>(mapFn: (store: Actions<ToStoreType<Model>>) => Result) => ((store:any) => Result extends ToStoreType<infer R> ? R : Result);

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

