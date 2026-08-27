import "../style/PhoneAlert.scss";

export default function PhoneAlert() {
  return (
    <div className="se-alert">
      <div className="se-alert__time">2:47 AM</div>
      <div className="se-alert__bubble">
        <div className="se-alert__badge" aria-hidden="true" />
        <div className="se-alert__text">
          <div className="se-alert__title">Shorts Engine</div>
          <div className="se-alert__body">Upload failed: GesoLore render error</div>
        </div>
      </div>
    </div>
  );
}
