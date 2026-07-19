"use client";

import {
    Code2,
    Briefcase,
    Award,
    GraduationCap,
} from "lucide-react";

interface StatsProps {
    projectsCount: number;
    experiencesCount: number;
    certificatesCount: number;
    educationsCount: number;
}

export default function Stats({
    projectsCount,
    experiencesCount,
    certificatesCount,
    educationsCount,
}: StatsProps) {
    const stats = [
        {
            icon: <Code2 size={32} />,
            value: projectsCount,
            label: "Projects",
        },
        {
            icon: <Briefcase size={32} />,
            value: experiencesCount,
            label: "Experience",
        },
        {
            icon: <Award size={32} />,
            value: certificatesCount,
            label: "Certificates",
        },
        {
            icon: <GraduationCap size={32} />,
            value: educationsCount,
            label: "Education",
        },
    ];

    return (
        <section className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((item) => (
                    <div
                        key={item.label}
                        className="
              bg-white/5
              backdrop-blur-xl
              border border-white/10
              rounded-3xl
              p-8
              text-center
              hover:scale-105
              transition
              duration-300
            "
                    >
                        <div className="text-cyan-400 flex justify-center mb-4">
                            {item.icon}
                        </div>

                        <h3 className="text-4xl font-bold">
                            {item.value}
                        </h3>

                        <p className="text-gray-400 mt-2">
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}