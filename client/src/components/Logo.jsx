export default function Logo({ size = 36, wordmark = false }) {
  return (
    <span className="logo-lockup">
      <img src={`${import.meta.env.BASE_URL}logo.png`} alt="DriveControl" width={size} height={size} className="logo-mark" />
      {wordmark && (
        <span className="wordmark">
          Drive<em>Control</em>
        </span>
      )}
    </span>
  );
}
