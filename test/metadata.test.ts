import "jest";

import { Action, Computed, Model, Property, Thunk, Listener } from "../src/decorators";
import { createStore } from "../src/create-store";
import { TargetPayload } from "easy-peasy";
import { ModelBase } from "../src/base-class";

describe("metadata", () => {
    it("collects property metadata", () => {
        @Model
        class StoreModel extends ModelBase{
            public notAProperty = 1;

            @Property
            public property = 2;
        }

        const store = createStore<StoreModel>(StoreModel.obj);

        expect(store.getState().notAProperty).toEqual(undefined);
        expect(store.getState().property).toEqual(2);
    });
})