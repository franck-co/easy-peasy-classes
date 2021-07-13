import { Actions, State } from "easy-peasy";
import { Model, Property } from "./decorators";
import { ToStoreType} from "./types";


export abstract class ModelBasePure {
    static get obj() {
        return {} as any
    }
}

@Model()
export abstract class ModelBase extends ModelBasePure{

    @Property()
    private _isHoldingChildren: boolean = false
}




type getStoreState<StoreModel extends object> = () => State<ToStoreType<StoreModel>> & { [key: string]: any }
type getStoreActions<StoreModel extends object> = () => Actions<ToStoreType<StoreModel>> & { [key: string]: any }

interface createTypedHooksReturn<Model extends object> {
    useStoreState: <Result>(
        mapState: (state: State<ToStoreType<Model>>) => Result,
        dependencies?: any[],
    ) => Result;
}

type getStoreStateClone<StoreModel extends object> = createTypedHooksReturn<StoreModel>['useStoreState']


export abstract class ModelBasePureTyped<StoreModel extends object> extends ModelBasePure {

    protected getStateClone: () => this = undefined as unknown as () => this
    protected getStoreStateClone: getStoreStateClone<StoreModel> = undefined as unknown as getStoreStateClone<StoreModel>

    protected getStoreActions: getStoreActions<StoreModel> = undefined as unknown as getStoreActions<StoreModel>
    protected getStoreState: getStoreState<StoreModel> = undefined as unknown as getStoreState<StoreModel>

}

export abstract class ModelBaseTyped<StoreModel extends object> extends ModelBase {

    protected getStateClone: () => this = undefined as unknown as () => this
    protected getStoreStateClone: getStoreStateClone<StoreModel> = undefined as unknown as getStoreStateClone<StoreModel>

    protected getStoreActions: getStoreActions<StoreModel> = undefined as unknown as getStoreActions<StoreModel>
    protected getStoreState: getStoreState<StoreModel> = undefined as unknown as getStoreState<StoreModel>

}
