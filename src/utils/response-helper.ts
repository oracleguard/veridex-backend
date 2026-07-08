export function successResponse(data: any, message: string = "Success") {
  return { success: true, data, message };
}

export function errorResponse(error: string, details?: any) {
  return { success: false, error, details };
}
