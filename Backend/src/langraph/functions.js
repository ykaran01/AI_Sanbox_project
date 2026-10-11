export const routeAfterExecution = (state) => {
    if (state.job.success) {
        return "success";
    }

    if (state.job.iteration >= state.job.maxIterations) {
        return "failed";
    }

    return "fix";
};

export const routeFortheCode = (state) => {
    if (state.job.type === "message") {
        state.job.success = true
        return "message";
    }

    return "code";
};

export const routefortheSummary = (state)=>{
    if(state.messages.length>12){
        return "summary"
    }
    return "no"
}