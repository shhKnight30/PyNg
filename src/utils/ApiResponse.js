class ApiResponse{
    constructor(statusCode,data,message){
        this.statusCode = statusCode
        this.data = data 
        this.message = message
        this.success = (statusCode<400) ? true : false
        console.log(data) // remove after testing in the end 
    }
}

export {ApiResponse}