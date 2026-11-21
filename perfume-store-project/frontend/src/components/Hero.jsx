import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api/api";
import "./Hero.css";

const MIN_ITEMS = 6;
const MAX_ITEMS = 8;

export default function Hero() {
  const [items, setItems] = useState([]);
  const [videoOk, setVideoOk] = useState(true);

  // Products ki images lo: pehle featured, na hon to saare
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let res = await fetch(`${API_URL}/products?featured=true`);
        let list = res.ok ? await res.json() : [];

        if (!Array.isArray(list) || list.filter((p) => p.images?.[0]?.url).length < 3) {
          res = await fetch(`${API_URL}/products`);
          list = res.ok ? await res.json() : [];
        }

        const withImages = (Array.isArray(list) ? list : [])
          .filter((p) => p.images?.[0]?.url)
          .slice(0, MAX_ITEMS)
          .map((p) => ({ id: p._id, name: p.name, url: p.images[0].url }));

        if (!cancelled) setItems(withImages);
      } catch {
        if (!cancelled) setItems([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ring poora bharne ke liye kam se kam 6 items (zaroorat ho to repeat)
  const ring = [];
  const source = items.length > 0 ? items : Array.from({ length: MIN_ITEMS }, () => null);
  const total = Math.max(MIN_ITEMS, source.length);
  for (let i = 0; i < total; i++) {
    ring.push(source[i % source.length]);
  }
  const step = 360 / ring.length;

  return (
    <section className="hs-hero">
      {/* Optional background video: frontend/public/hero.mp4 */}
      {videoOk && (
        <video
          className="hs-video"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoOk(false)}
        />
      )}
      <div className="hs-overlay" />
      <div className="hs-glow" />

      {/* 3D orbit scene */}
      <div className="hs-scene" aria-hidden="true">
        <div className="hs-tilt">
          <div className="hs-ring" style={{ "--n": ring.length }}>
            {ring.map((item, i) => {
              const angle = i * step;
              const card = (
                <div className="hs-card">
                  {item ? (
                    <img src={item.url} alt={item.name} loading="lazy" />
                  ) : (
                    <div className="hs-bottle">
                      <span className="hs-cap" />
                      <span className="hs-neck" />
                      <span className="hs-body">AF</span>
                    </div>
                  )}
                </div>
              );

              return (
                <div
                  className="hs-item"
                  key={i}
                  style={{ "--a": `${angle}deg` }}
                >
                  <div className="hs-face">
                    {item ? (
                      <Link to={`/product/${item.id}`} tabIndex={-1}>
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="hs-floor" />
      </div>

      {/* Text */}
      <div className="hs-content">
        <span className="hs-eyebrow">AF Perfumes</span>
        <h1 className="hs-title">
          Make every moment <em>unforgettable.</em>
        </h1>
        <p className="hs-sub">
          Luxury fragrances crafted to leave a lasting impression. Cash on
          Delivery available all over Pakistan.
        </p>
        <div className="hs-buttons">
          <Link to="/shop" className="hs-btn hs-btn-gold">
            Shop Now
          </Link>
          <a href="#featured" className="hs-btn hs-btn-ghost">
            Explore
          </a>
        </div>
      </div>
    </section>
  );
}