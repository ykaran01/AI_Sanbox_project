

export class ApiResponse {
    constructor(status, data,message) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}