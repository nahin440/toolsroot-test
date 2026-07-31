import { FaXTwitter, FaFacebookF, FaLinkedin } from "react-icons/fa6";

// Central place for the site's social profile URLs so the footer and
// contact page (and anywhere else that links out) can't drift out of sync.
export const SOCIAL_LINKS = [
  { name: "X (Twitter)", href: "https://x.com/toolsrootweb", Icon: FaXTwitter },
  { name: "Facebook", href: "https://www.facebook.com/toolsroot", Icon: FaFacebookF },
  { name: "Linkedin", href: "https://www.linkedin.com/company/toolsroot", Icon: FaLinkedin },
];

/**
 * Fully round social icon buttons. Same rounded-full / bg-accent-tint
 * language used elsewhere on the site (see tool-page-layout's step
 * badges and the contact page's email icon), with an accent-fill hover
 * state matching the primary Button component's hover treatment.
 */
export function SocialLinks({ className = "", iconClassName = "size-4" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIAL_LINKS.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          title={name}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Icon className={iconClassName} />
        </a>
      ))}
    </div>
  );
}
