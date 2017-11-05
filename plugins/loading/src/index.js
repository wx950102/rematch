// @flow
const createLoadingAction = (show) => (state, { name, action }) => ({
  ...state,
  global: show,
  models: { ...state.models, [name]: show },
  effects: {
    ...state.effects,
    [name]: {
      ...state.effects[name],
      [action]: show
    }
  }
})

export default (config = {}) => {
  const loadingModelName = config.name || 'loading'
  const model = {
    name: loadingModelName,
    state: {
      global: false,
      models: {},
      effects: {}
    },
    reducers: {
      show: createLoadingAction(true),
      hide: createLoadingAction(false),
    }
  }
  return {
    init: ({ dispatch }) => ({
      model,
      onModel({ name }) {
        // do not run dispatch on loading model
        if (name === loadingModelName) { return }
        model.state.models[name] = false
        model.state.effects[name] = {}
        const modelActions = dispatch[name]
        // map over effects within models
        Object.keys(modelActions).forEach(action => {
          if (dispatch[name][action].isEffect) {
            // copy function
            model.state.effects[name][action] = false
            const fn = dispatch[name][action]
            // create function with pre & post loading calls
            const dispatchWithHooks = async function dispatchWithHooks(props) {
              dispatch.loading.show({ name, action })
              await fn(props)
              // waits for dispatch function to finish before calling "hide"
              dispatch.loading.hide({ name, action })
            }
            // replace existing effect with new dispatch
            dispatch[name][action] = dispatchWithHooks
          } else {
            model.state.models[name] = false
          }
        })
      }
    })
  }
}