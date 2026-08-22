"use client";

export function SiteVerdict({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <>
      <div className="site-overview-col site-overview-pros">
        <p className="site-overview-label">pros</p>
        <ul className="site-verdict-list">
          {pros.map((pro) => (
            <li key={pro} className="site-verdict-line">
              <span className="site-verdict-mark site-verdict-mark-pro" aria-hidden="true">
                +
              </span>
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="site-overview-col site-overview-cons">
        <p className="site-overview-label">cons</p>
        <ul className="site-verdict-list">
          {cons.map((con) => (
            <li key={con} className="site-verdict-line site-verdict-line-con">
              <span className="site-verdict-mark site-verdict-mark-con" aria-hidden="true">
                −
              </span>
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
