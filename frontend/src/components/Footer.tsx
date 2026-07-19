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
        <footer className="mt-32 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-16">

                <h3 className="text-3xl font-bold text-center">
                    {profile?.fullName || "Portfolio"}
                </h3>

                <p className="text-center text-gray-400 mt-3">
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
                                className="text-gray-400 hover:text-cyan-400 transition-colors"
                            >
                                <Icon size={22} />
                            </a>
                        ))}
                    </div>
                )}

                <p className="text-center text-gray-500 mt-8">
                    © {new Date().getFullYear()} {profile?.fullName || "Portfolio"}. All Rights Reserved.
                </p>

            </div>
        </footer>
    );
}
