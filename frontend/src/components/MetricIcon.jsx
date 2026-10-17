export default function MetricIcon({ name }) {
  const paths = {
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2.5" /><path d="M3 9h18m-5 5h.01M7 5V3.5h10V5" /></>,
    'arrow-down': <><path d="M12 4v15m0 0 6-6m-6 6-6-6" /><path d="M4 4h4" /></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}