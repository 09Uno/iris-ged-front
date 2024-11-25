export class MessageUtil {
  static displayErrorMessage(context: any, message: string, duration: number = 10000) {
    context.messages.errorMessage = message;
    setTimeout(() => {
      context.messages.errorMessage = null;
    }, duration);
  }

  static displayAlertMessage(context: any, message: string, duration: number = 100000) {
    context.messages.alertMessage = message;
    setTimeout(() => {
      context.messages.alertMessage = null;
    }, duration);
  }
}
