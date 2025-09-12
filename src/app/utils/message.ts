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

  static displaySuccessMessage(context: any, message: string, duration: number = 5000) {
    context.messages.successMessage = message;
    setTimeout(() => {
      context.messages.successMessage = null;
    }, duration);
  }
}
