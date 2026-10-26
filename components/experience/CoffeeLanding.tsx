import { AwakeLogo } from "@/components/cold-brew/AwakeLogo";
import { coldBrew } from "@/content/cold-brew";
export function CoffeeLanding() {
  return (
    <section className="coffee-portal-content" aria-labelledby="portal-title">
      <div className="flex items-center justify-between gap-4">
        <div className="portal-logo">
          <AwakeLogo />
        </div>
        <a className="text-link" href="/cold-brew/">
          Full brew studio ↗
        </a>
      </div>
      <h2 id="portal-title">
        A little time.
        <br />A proper cold brew.
      </h2>
      <p>Steeped 48 Hours. Hits Fast.</p>
      <p className="muted">
        Made at home in Jaipur. Real spices, zero syrups. Pick a flavour and
        I’ll tell you what’s brewing.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {coldBrew.flavours.map((flavour) => (
          <a
            key={flavour.key}
            href={`/cold-brew/?flavour=${flavour.key}`}
            className="portal-flavour"
            style={{ "--item-color": flavour.color } as React.CSSProperties}
          >
            <strong>{flavour.name}</strong>
            <span>
              ₹{coldBrew.price} · {coldBrew.volume} ↗
            </span>
          </a>
        ))}
      </div>
      <a className="action primary-action" href="/cold-brew/">
        Explore A•WAKE ↗
      </a>
    </section>
  );
}
