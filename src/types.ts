import { Action, Thunk, State, Actions } from 'easy-peasy';

export type ComputedType<T> = T & { computed?: undefined };


//Fonctionnel
//Ajout des call signatures pour Action et Thunk
//Pas de récursivité
export type ToStoreType<T extends object> = {
    [P in keyof T]: 'computed' extends keyof T[P]
        ? T[P] extends ComputedType<infer U>
            ? U
            : T[P]
        : T[P] extends (...args: any[]) => any //An action or a thunk from easy-peasy-decorators is a class method, thus a function. If it's not it is a property (or a classic easy-peasy Action/Thunk)
            ? ReturnType<T[P]> extends void     //Unlike thunk, an action doesn't return anything. This is how we can make the diffrence
                ? Action<T, Parameters<T[P]>[0] extends undefined ? void : Parameters<T[P]>[0]> & Function
                : Thunk<T, Parameters<T[P]>[0], void, {}, ReturnType<T[P]>> & Function

            // : T[P] extends Action
            //     ? T[P] & Function
            //     : T[P] extends Thunk 
            //         ? T[P] & Function
                    : T[P] extends object 
                        ? ToStoreType<T[P]>
                        : T[P]

};


type FilterFlagsRemove<Base, Condition> = {
    [Key in keyof Base]:
    Base[Key] extends Condition ? never : Key
};

type AllowedNamesRemove<Base, Condition> =
    FilterFlagsRemove<Base, Condition>[keyof Base];

type SubTypeRemove<Base, Condition> =
    Pick<Base, AllowedNamesRemove<Base, Condition>>;

type StateOnly1<T extends object> = SubTypeRemove<T,Function>
export type StateOnlyRecursive<T extends object> = {
    [P in keyof StateOnly1<T>]: T[P] extends object ? StateOnlyRecursive<T[P]> : T[P]
}

export type UnpackToStoreType<Result> = Result extends ToStoreType<infer R> ? R : Result
export type UnpackStateOnlyRecursive<T> = T extends StateOnlyRecursive<infer U> ? U : T;



//We combine Action and Thunks with Function to provide call signature
//If the type is already an Action or a Thunk (defined the classic easy-peasy way), we don't pass it to ToStoreType, we return directly T[P]
