export function Logo({ size = 34, showText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        aria-label="KrishiRakshak AI logo"
        title="KrishiRakshak AI"
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(18,185,129,1), rgba(73,213,169,0.65))',
          display: 'grid',
          placeItems: 'center',
          color: '#061016',
          fontWeight: 900,
          boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
        }}
      >
        KA
      </div>
      {showText ? (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>KrishiRakshak AI</div>
          <div className="muted" style={{ fontSize: 12 }}>
            Smart Agriculture • AgriTech
          </div>
        </div>
      ) : null}
    </div>
  )
}

