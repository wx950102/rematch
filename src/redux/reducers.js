// @flow
/* eslint no-underscore-dangle: 0 */
import { combineReducers } from 'redux'

let _reducers: $reducers
let combine = combineReducers

// get reducer for given dispatch type
// pass in (state, payload)
export const getReducer = (reducer: $reducers, initialState: any) => (
  state: any = initialState,
  action: $action,
) => {
  if (typeof reducer[action.type] === 'function') {
    return reducer[action.type](state, action.payload)
  }
  return state
}

// creates a reducer out of "reducers" keys and values
export const createModelReducer = ({ name, reducers, state }: $model) => ({
  [name]: getReducer(Object.keys(reducers || {}).reduce((acc, reducer) => {
    acc[`${name}/${reducer}`] = reducers[reducer]
    return acc
  }, {}), state),
})

// uses combineReducers to merge new reducers into existing reducers
export const mergeReducers = (nextReducers: $reducers) => {
  _reducers = { ..._reducers, ...nextReducers }
  return combine(_reducers)
}

export const initReducers = ({ customCombineReducers }) : void => {
  // overwrite combineReducers if config.customCombineReducers
  if (customCombineReducers) {
    combine = customCombineReducers
  }
  _reducers = {}
}
