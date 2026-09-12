export const routeAfterExecution = (state) => {
    if (state.success) {
        return "success"
    }
    if (state.iteration >= state.maxiterations) {
        return "failed"
    }
    return "fix"
}

export const routeFortheCode = (state) => {

    if(state.type==="message"){
        return "message"
    }
    return "code"
}

