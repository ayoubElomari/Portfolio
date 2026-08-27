import { useEffect } from "react";

import { useLanguage } from "../i18n/LanguageContext.jsx";

import "./style/Toast.scss";

function Toast({ message, onDismiss, duration = 6000 }) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDismiss, duration);
    return () => clearTimeout(id);
  }, [message, duration, onDismiss]);

  return (
    <div
      className={"app-toast" + (message ? " visible" : "")}
      role="status"
      aria-live="polite"
    >
      {message && (
        <>
          <span className="toast-message">{message}</span>
          <button
            type="button"
            className="toast-close"
            aria-label={t("toast.dismiss")}
            onClick={onDismiss}
          >
            &times;
          </button>
        </>
      )}
    </div>
  );
}

export default Toast;
