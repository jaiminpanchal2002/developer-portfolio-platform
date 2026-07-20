import { Mail, Globe, Link as LinkIcon } from "lucide-react";
import { Profile } from "@/types";

interface FooterProps {
    profile?: Partial<Profile>;
}

export default function Footer({ profile }: FooterProps) {
    const links = [
        profile?.githubUrl && {
            href: profile.githubUrl.startsWith("http") ? profile.githubUrl : `https://${profile.githubUrl}`,
            label: "GitHub",
            icon: Globe,
        },
        profile?.linkedinUrl && {
            href: profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`,
            label: "LinkedIn",
            icon: LinkIcon,
        },
        profile?.email && {
            href: `mailto:${profile.email}`,
            label: "Email",
            icon: Mail,
        },
    ].filter(Boolean) as { href: string; label: string; icon: typeof Mail }[];

    return (
        <footer className="mt-32 border-t" style={{ borderColor: "var(--noir-border)" }}>
            <div className="max-w-7xl mx-auto px-6 py-16">

                <h3
                    className="font-[family-name:var(--font-serif)] italic text-3xl text-center"
                    style={{ color: "var(--noir-fg)" }}
                >
                    {profile?.fullName || "Portfolio"}
                </h3>

                <p className="text-center mt-3" style={{ color: "var(--noir-fg-muted)" }}>
                    {profile?.headline || "Full Stack Developer"}
                </p>

                {links.length > 0 && (
                    <div className="flex justify-center gap-6 mt-8">
                        {links.map(({ href, label, icon: Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target={href.startsWith("mailto:") ? undefined : "_blank"}
                                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                                aria-label={label}
                                className="transition-colors hover:opacity-70"
                                style={{ color: "var(--noir-fg-muted)" }}
                            >
                                <Icon size={22} />
                            </a>
                        ))}
                    </div>
                )}

                <p className="text-center mt-8 text-sm" style={{ color: "var(--noir-fg-subtle)" }}>
                    © {new Date().getFullYear()} {profile?.fullName || "Portfolio"}. All Rights Reserved.
                </p>

            </div>
        </footer>
    );
}
