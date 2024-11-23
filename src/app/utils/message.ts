export class MessageUtil {
  static displayErrorMessage(context: any, message: string, duration: number = 10000) {
    context.errorMessage = message;
    setTimeout(() => {
      context.errorMessage = null;
    }, duration);
  }

  static displayAlertMessage(context: any, message: string, duration: number = 100000) {
    context.alertMessage = message;
    setTimeout(() => {
      context.alertMessage = null;
    }, duration);
  }
}