import { AwakeLogo } from "@/components/cold-brew/AwakeLogo";
import { coldBrew } from "@/content/cold-brew";
import { sitePath } from "@/lib/sitePath";
export function CoffeeLanding() {
  return (
    <section className="coffee-portal-content" aria-labelledby="portal-title">
      <div className="coffee-portal-heading">
        <div className="portal-logo">
          <AwakeLogo />
        </div>
        <h2 id="portal-title">A little time.<br />A proper cold brew.</h2>
      </div>
      <p>Steeped 48 Hours. Hits Fast.</p>
      <p className="muted">
        Made at home in Jaipur. Real spices, zero syrups. Pick your flavour.
      </p>
      <div className="portal-flavours grid grid-cols-3 gap-2">
        {coldBrew.flavours.map((flavour) => (
          <a
            key={flavour.key}
            href={sitePath(`/cold-brew/?flavour=${flavour.key}`)}
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
      <a className="action primary-action" href={sitePath("/cold-brew/")}>
        Explore A•WAKE ↗
      </a>
    </section>
  );
}
