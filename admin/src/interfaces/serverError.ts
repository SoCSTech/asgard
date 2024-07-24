export function getErrorMessage(error: IServerError, defaultMessage = "Something went wrong"): string {
    return error.response.data.message || error.message || defaultMessage;
}

export interface IServerError {
    message: string;
    response: {
        data: {
            message: string;
        };
    };
}
