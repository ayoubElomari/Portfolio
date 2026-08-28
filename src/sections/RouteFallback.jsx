import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./style/RouteFallback.scss";

/* Shown while a lazily-loaded route chunk is in flight. Two things it has to
   do beyond looking right: hold a tall block so the footer doesn't jump up
   under the header and back down, and stay invisible for the first quarter
   second — most chunks arrive faster than that, and a flash of "loading" on
   every navigation is worse than nothing. The delay lives in the stylesheet
   as an animation delay, not a timer here. */
export default function RouteFallback() {
  const { t } = useLanguage();

  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <div className="route-fallback-inner">
        <span className="route-fallback-label">{t("common.loading")}</span>
        <span className="route-fallback-track" aria-hidden="true">
          <span className="route-fallback-bar" />
        </span>
      </div>
    </div>
  );
}
