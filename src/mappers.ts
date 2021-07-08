import { State, Actions } from "easy-peasy";
import { ToStoreType } from "./types";

type freeObj = {[key:string]:any}

interface getMapperFactoryResult<Model extends object> {
    useMapper: <Result>(mapFn: (store: ToStoreType<Model>) => Result) => ((store: any /**Must be any */) => Result);
    useMapperState: <Result>(mapFn: (store: State<ToStoreType<Model>>) => Result) => ((store: any) => Result);
    useMapperActions: <Result>(mapFn: (store: Actions<ToStoreType<Model>>) => Result) => ((store:any) => Result);

    useMapperLoose: <Result>(mapFn: (store: Model & freeObj) => Result  & freeObj) => ((store: Model   & freeObj) => Result  & freeObj );
}


export function getMapperFactory<Model extends object>(): getMapperFactoryResult<Model> {
    return {
        useMapper: i => i,
        useMapperActions:i=>i,
        useMapperState:i=>i,

        useMapperLoose : i => i,
    }// as any;
}

