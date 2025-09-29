import { ToastCtrl } from "./Toast.ctrl"

// Instance globale du contrôleur de toast
const globalToastCtrl = ToastCtrl()

export const useToast = () => {
  return globalToastCtrl
}

// Export des méthodes de convenance pour une utilisation directe
export const toast = {
  success: globalToastCtrl.success,
  error: globalToastCtrl.error,
  warning: globalToastCtrl.warning,
  info: globalToastCtrl.info,
  add: globalToastCtrl.addToast,
  remove: globalToastCtrl.removeToast,
  clear: globalToastCtrl.clearAll
}
