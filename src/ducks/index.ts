import { createEpicMiddleware } from "redux-observable";
import { Action } from "redux-actions";
import reducers, { RootState } from "./reducers";
import epics from "./epics";
import { createStore, applyMiddleware, compose } from "redux";

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : Function
  }
}
const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // Specify extension’s options like name, actionsDenylist, actionsCreators, serialize...
          serialize: true
      })
      : compose;

const epicMiddleware = createEpicMiddleware<
  Action<any>,
  Action<any>,
  RootState
>();

function configureStore (initialState?: RootState) {
    const middleware = [epicMiddleware];
    const enhancer = composeEnhancers(applyMiddleware(...middleware));
    return createStore(reducers, initialState, enhancer);
}

export const store = configureStore();

export type AppDispatch = typeof store.dispatch

epicMiddleware.run(epics as any);
