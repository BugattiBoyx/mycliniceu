export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: "72px var(--gutter) var(--section-pad-y)",
        maxWidth: "var(--content-max-editorial)",
        margin: "0 auto",
        minHeight: "50vh",
      }}
    >
      <h1
        className="mj-serif"
        style={{
          fontSize: "var(--fs-h1)",
          color: "var(--color-text)",
          margin: "0 0 32px",
        }}
      >
        {title}
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          fontSize: 15,
          lineHeight: "var(--lh-body)",
          color: "var(--color-text-soft)",
          maxWidth: 680,
        }}
      >
        {children}
      </div>
    </section>
  );
}
